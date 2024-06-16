import { exec, execSync } from 'child_process';
import * as fs from 'fs-extra';
import path from 'path';
import { optimizeJS } from './optimize';
import { startLoading, stopLoading } from './util/loading';

console.clear();

// 리엑트 빌드
console.log("리엑트 빌드 중")

exec("cd.. && cd renderer && npm run build", (err, stdout, stderr) => {
    if(err) throw err;
    if(stderr) console.error(stderr);

    // 일렉트론 컴파일    
    exec("cd.. && cd electron && tsc", async (err, stdout, stderr) => {
        if(err) throw err;
        if(stderr) console.error(stderr);

        const finalFolder = path.join('..','electron','final');

        console.log("final 폴더 초기화")
        await fs.ensureDir(finalFolder);
        await fs.emptyDir(finalFolder);

        // 리엑트 빌드     -> 일렉트론 final
        // 일렉트론 public -> 파일 최적화 -> 일렉트론 final
        const reactBuildFolder      = path.join('..','renderer','build')
        const electronPublicFolder  = path.join(__dirname,'..','electron','public')

        console.log("리엑트 빌드 파일들을 final 폴더로 복사 중")
        await fs.copy(reactBuildFolder, finalFolder);

        // 최적화
        console.log("일렉트론 public 폴더의 파일들을 terser로 최적화 중")

        
        let optiCalled = -1;

        async function optimize(targetFolder: string) {

            if(optiCalled === -1) {
                optiCalled = 1;
            }

            for (let file of await fs.readdir(targetFolder, { withFileTypes: true })) {
        
                // 절대경로
                let absPath = path.join(targetFolder, file.name);
        
                // electronPublicFolder 내부를 기준으로 하는 부모 경로
                let relativeParentPath = targetFolder.replace(electronPublicFolder, "");
        
                if (relativeParentPath.startsWith("/")) {
                    relativeParentPath = relativeParentPath.slice(1);
                }
        
                // .js 파일이면 최적화 후 final에 출력
                if (file.isFile() && file.name.endsWith(".js")) {
                    const outDir = path.join(finalFolder, relativeParentPath);
        
                    await optimizeJS(absPath, outDir);
        
                    console.log(` -> (최적화) ${relativeParentPath}/${file.name} (parent: ${relativeParentPath}, outDir: ${outDir})`);
                } 
        
                // 파일이지만 .js 파일이 아님 -> 그냥 final 폴더에 복사
                else if (file.isFile() && !file.name.endsWith(".js")) {
                    const dest = path.join(finalFolder, relativeParentPath, file.name);
        
                    await fs.copy(absPath, dest);
                    console.log(` -> (최적화 안 함) ${relativeParentPath}/${file.name} (parent: ${relativeParentPath}, dest: ${dest})`);
                }
        
                // 폴더면 final 폴더에 생성 후 재귀
                else if (file.isDirectory()) {
                    const folderPath = path.join(finalFolder, relativeParentPath);
        
                    if (!await fs.exists(folderPath)) {
                        await fs.mkdir(folderPath);
                        console.log(` -> (재귀) 폴더 생성 후 재귀 (folderPath: ${folderPath})`);
                    }
        
                    await optimize(absPath); 
                }
            }

            optiCalled--;
        }

        await optimize(electronPublicFolder);

        // startLoading("최적화가 완료될 때까지 기다리는 중");
        // while(optiCalled !== 0) { }
        // stopLoading("");

        console.log("일렉트론 빌드 중")
        
        exec("cd.. && cd electron && npm run electron:build-window", (err, stdout, stderr) => {
            if(err) throw err;
            if(stderr) console.error(stderr);

            console.log("끗");
        })
    })
})