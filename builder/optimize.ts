import { minify } from 'terser';
import * as fs from 'fs-extra';
import * as path from 'path';

export async function optimizeJS(inputPath: string, outputDir: string): Promise<void> {
    try {
        // 입력 파일 읽기
        const jsCode = await fs.readFile(inputPath, 'utf8');

        // Terser를 사용하여 최적화
        const result = await minify(jsCode);

        // 출력 경로 생성
        const fileName = path.basename(inputPath);
        const outputPath = path.join(outputDir, fileName);

        // 출력 디렉토리가 존재하지 않으면 생성
        await fs.ensureDir(outputDir);

        // 최적화된 코드 저장
        await fs.writeFile(outputPath, result.code || '', 'utf8');
    } catch (error) {
        console.error('최적화 실패:', error);
    }
}
