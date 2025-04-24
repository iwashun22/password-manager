const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const Sqlite = require('better-sqlite3');
const { encryptDB, cleanupTemp, db, initializeSchema, tempFilePath } = require('./utils/initData.cjs');
const {
  createEmailAccount,
  createServiceAccount,
  getAllEmailAccounts,
  editEmailAccount,
  getSystemPassword,
  getBackupData,
  storePassword
} = require('./utils/eventHandler.cjs');

const isDev = !app.isPackaged;

ipcMain.handle('db:create-email-acc', createEmailAccount);
ipcMain.handle('db:create-service-acc', createServiceAccount);
ipcMain.handle('db:get-all-email-accs', getAllEmailAccounts);
ipcMain.handle('db:edit-email-acc', editEmailAccount);

ipcMain.handle('user:get-system-pw', getSystemPassword);
ipcMain.handle('user:store-password', storePassword);

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
  if (db === null) {
    const choice = dialog.showMessageBoxSync({
      type: 'warning',
      buttons: ['Cancel', 'Create New'],
      defaultId: 1,
      cancelId: 0,
      title: 'Data Error',
      message: 'Failed to open your data.\n\nDo you want to create new data?\nAll previous data will be lost unless you have a BACKUP file and RECOVERY KEY.',
    });

    if (choice === 1) {
      console.log('Creating new data...');
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

      const newDB = new Sqlite(tempFilePath);
      initializeSchema(newDB);
      encryptDB();
      cleanupTemp();
    } else {
      console.log('User canceled. Exiting..');
    }

    app.quit();
  }

  createWindow();

  // On macOS: After closing the window, the app is still running, so this event still triggers.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })
});

app.on('before-quit', () => {
  try {
    encryptDB();
    cleanupTemp();
  } catch (err) {
    console.error('Failed to encrypt DB before quitting:', err);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


// let cleared = false;
// function beforeExit() {
//   if (cleared) return;
//   process.stdin.write('\n\nCleaning up before exit...\n\n');
//   encryptDB();
//   cleanupTemp();
//   cleared = true;

//   setTimeout(() => {
//     process.exit(0);
//   }, 100);
// }

// process.once('SIGINT', beforeExit);
// process.once('SIGTERM', beforeExit);
// process.once('exit', beforeExit);
