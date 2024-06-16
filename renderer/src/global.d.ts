interface Window {
    electron: {
        send: (ev: string, args: any) => void,
        receive: (ev: string, listener: (l: any, args:any) => void) => void
    }
}