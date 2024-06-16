// src/index.ts
let loadingInterval

export function startLoading(message: string, frames: string[] = ['-', '\\', '|', '/']) {
    let i = 0;

    loadingInterval = setInterval(() => {
        process.stdout.write(`\r${frames[i++ % frames.length]} ${message}`);
    }, 100);
}

export function stopLoading(message: string) {
    clearInterval(loadingInterval);
    process.stdout.write(`\r${message}\n`);
}