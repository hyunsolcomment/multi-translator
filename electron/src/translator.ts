import { LangType } from "./@types/LangType";
import axios from 'axios';
import puppeteer, { Page } from 'puppeteer';

export class Translator {

    private static async createBrowser(url: string) {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page    = await browser.newPage();

        /*  페이지 최적화  */
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        
        await page.setRequestInterception(true);
        
        page.on('request', (request) => {

            const filterFlag = (
                ['image', 'font'].includes(request.resourceType()) || 
                url.includes('google-analytics.com') || 
                url.includes('doubleclick.net')
            )

            if (filterFlag) {
                request.abort();
            } else {
                request.continue();
            }
        });

        /*  유저 설정  */

        // User-Agent 설정
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // 기본 viewport 설정
        await page.setViewport({
            width: 1366,
            height: 768,
            deviceScaleFactor: 1,
        });

        // navigator properties 설정
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'platform', {
                get: () => 'Win32',
            });
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });

        return {browser,page}
    }
    
    static async google(source: string, startLang: LangType, targetLang: LangType) {

        try {
            let url = 'https://translate.googleapis.com/translate_a/single'
    
            const {data} = await axios.get(url, {
                params: {
                    client: 'gtx',
                    dt: 't',
                    sl: startLang,
                    tl: targetLang,
                    q: source
                }
            });

            return (data[0] as string[][]).map(arr => arr[0]).join("");

        } catch (err) {

            throw err;
        }
    }

    static async papago(source: string, startLang: LangType, targetLang: LangType) {

        const {browser,page} = await Translator.createBrowser('https://papago.naver.com/');

        try {

            await page.type('#txtSource', source);

            /** 시작 언어를 n번째로 변경 */
            async function setStartLang(ntd: number) {
                await page.click("#ddSourceLanguageButton");

                let s = `#ddSourceLanguage ul>li:nth-child(${ntd})`;
                await page.waitForSelector(s, { visible: true });
                await page.click(s);
            }

            /** 도착 언어를 n번째로 변경 */
            async function setTargetLang(ntd: number) {
                await page.click("#ddTargetLanguage2Button");

                let s = `#ddTargetLanguage2 ul>li:nth-child(${ntd})`;
                await page.waitForSelector(s, { visible: true });
                await page.click(s);
            }

            switch(startLang) {
                case LangType.KO:

                    // 시작 언어: 한국어
                    await setStartLang(2);
                    break;

                case LangType.EN:

                    // 시작 언어: 영어
                    await setStartLang(3);
                    break;
            }
            
            switch(targetLang) {

                // 도착 언어 설정: 영어
                case LangType.EN:

                    // 목적 언어: 영어
                    await setTargetLang(2);

                    break;

                // 도착 언어 설정: 한국어
                case LangType.KO:

                    // 목적 언어: 한국어
                    await setTargetLang(1);
                    
                    break;
            }

            await page.click('#btnTranslate');
            
            await page.waitForFunction(() => {
                const targetElement = document.querySelector('#txtTarget');
                return targetElement && targetElement.textContent && targetElement.textContent.trim() !== '';
            }, { timeout: 5000 });

            await new Promise((page) => setTimeout(page, 300));

            const rs = await page.$eval('#txtTarget', el => el.textContent);

            return rs;

        } catch (err) {

            throw err;

        } finally {
            await browser.close();
        }
    }

    static async deepL(source: string, startLang: LangType, targetLang: LangType) {

        const url = `https://www.deepl.com/ko/translator#${startLang}/${targetLang}/${encodeURIComponent(source)}`;

        const {browser,page} = await Translator.createBrowser(url);
        
        try {
            
            await page.waitForFunction(() => {
                const targetElement = document.querySelector('d-textarea[data-testid="translator-target-input"]');
                return targetElement && targetElement.textContent && targetElement.textContent.trim() !== '';
            }, { timeout: 5000 });

            await new Promise((page) => setTimeout(page, 150));

            const rs = await page.$eval('d-textarea[data-testid="translator-target-input"]', el => el.textContent);

            return rs;

        } catch (err) {

            throw err;

        } finally {

            await browser.close();
        }
    }
}
