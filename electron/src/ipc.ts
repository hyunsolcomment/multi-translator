import { ipcMain } from "electron";
import { MAIN_WINDOW } from "./main";
import { Translator } from "./translator";

export function send(channel: string, data: any) {
    if(MAIN_WINDOW) {
        MAIN_WINDOW.webContents.send(channel, data);
    }
}

ipcMain.on('translate', async (ev, args) => {
    const source     = args.source;
    const startLang  = args.startLang;
    const targetLang = args.targetLang;

    if(!startLang || !targetLang || !source) { 
        send('error', '인자가 올바르지 않아요.')
        return;
    }

    // 구글 번역
    const google = await Translator.google(source, startLang, targetLang);

    // 파파고 번역
    const papago = await Translator.papago(source, startLang, targetLang);

    // 파파고 번역
    const deepL = await Translator.deepL(source, startLang, targetLang);

    send('translate-complete', { google, papago, deepL })
})