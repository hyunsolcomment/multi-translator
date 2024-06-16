import {app,BrowserWindow} from 'electron';
import path from 'path';
import { Global } from './global';
import './ipc';

export let MAIN_WINDOW: BrowserWindow;

function createWindow() {
    MAIN_WINDOW = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(Global.ROOT_FOLDER, 'preload.js')
        },
    })

    MAIN_WINDOW.setMenuBarVisibility(false);

    if(app.isPackaged) {
        MAIN_WINDOW.loadFile(path.join(Global.ROOT_FOLDER, 'index.html'));
    } else {
        MAIN_WINDOW.loadURL('http://localhost:3000');
    }
}

app.whenReady().then(() => {

    createWindow();
    
    app.on('window-all-closed', () => {
        app.exit();
    })
})