const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const {
  createEmailAccount,
  createServiceAccount,
  getAllEmailAccounts,
  editEmailAccount,
  getSystemPassword,
  getBackupData
} = require('./utils/eventHandler.cjs');

const isDev = !app.isPackaged;

ipcMain.handle('db:create-email-acc', createEmailAccount);
ipcMain.handle('db:create-service-acc', createServiceAccount);
ipcMain.handle('db:get-all-email-accs', getAllEmailAccounts);
ipcMain.handle('db:edit-email-acc', editEmailAccount);

ipcMain.handle('user:get-system-pw', getSystemPassword);

//TODO:
ipcMain.handle('backup:get-backup-data', getBackupData);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 700,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  }
  else {
    win.loadFile(path.resolve(__dirname, '../../dist/index.html'));
  }

}

app.whenReady().then(() => {
  createWindow();

  // On macOS: After closing the window, the app is still running, so this event still triggers.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});