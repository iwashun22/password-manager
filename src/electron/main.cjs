const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const Sqlite = require('better-sqlite3');
const { encryptDB, cleanupTemp, db, initializeSchema, tempFilePath } = require('./utils/initData.cjs');
const {
  createEmailAccount,
  createServiceAccount,
  createService,
  getAllEmailAccounts,
  getEmailAccount,
  getAllServices,
  getServiceAccountsLinkedToEmail,
  getServiceAccount,
  getServiceAccountsById,
  getOAuthProviders,
  editEmailAccount,
  editService,
  editServiceAccount,
  deleteEmailAccount,
  deleteServiceAccount,
  getSystemPassword,
  verifyPassword,
  verifyRecoveryKey,
  requestDecryptedPassword,
  getBackupData,
  storePassword,
  updatePassword,
  deleteAllData,
  formattingEmail,
  retryFetchFavicon,
  loadBackupData,
  loadEachService,
  checkKeySize
} = require('./utils/eventHandler.cjs');

const isDev = !app.isPackaged;

// /var/folders/b3/92wvs4691x54ssmhf3p6nz400000gn/T/
ipcMain.handle('db:create-email-acc', createEmailAccount);
ipcMain.handle('db:create-service-acc', createServiceAccount);
ipcMain.handle('db:create-service', createService);
ipcMain.handle('db:get-all-email-accs', getAllEmailAccounts);
ipcMain.handle('db:get-email-account', getEmailAccount);
ipcMain.handle('db:get-all-services', getAllServices);
ipcMain.handle('db:get-service-accs-linked-to-email', getServiceAccountsLinkedToEmail);
ipcMain.handle('db:get-service-account', getServiceAccount);
ipcMain.handle('db:get-service-accs-by-id', getServiceAccountsById);
ipcMain.handle('db:get-oauth-providers', getOAuthProviders);
ipcMain.handle('db:edit-email-acc', editEmailAccount);
ipcMain.handle('db:edit-service', editService);
ipcMain.handle('db:edit-service-acc', editServiceAccount);
ipcMain.handle('db:delete-email-acc', deleteEmailAccount);
ipcMain.handle('db:delete-service-acc', deleteServiceAccount);
ipcMain.handle('db:delete-all-data', deleteAllData);

ipcMain.handle('user:get-system-pw', getSystemPassword);
ipcMain.handle('user:store-password', storePassword);
ipcMain.handle('user:update-password', updatePassword);
ipcMain.handle('user:verify-password', verifyPassword);
ipcMain.handle('user:verify-recovery-key', verifyRecoveryKey);
ipcMain.handle('user:request-decrypted-password', requestDecryptedPassword);
ipcMain.handle('user:retry-fetch-favicon', retryFetchFavicon);
ipcMain.handle('user:formatting-email', formattingEmail);
ipcMain.handle('user:save-database', encryptDB);

ipcMain.handle('backup:get-backup-data', getBackupData);
ipcMain.handle('backup:load-backup-data', loadBackupData);
ipcMain.handle('backup:load-each-service', loadEachService);
ipcMain.handle('backup:check-key-size', checkKeySize);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 700,
    height: 500,
    icon: path.resolve(__dirname, '../../icons/icon/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
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
      console.log('\nCreating new data...\n');
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

      const newDB = new Sqlite(tempFilePath);
      initializeSchema(newDB);
      encryptDB();
      cleanupTemp();
    } else {
      console.log('User canceled. Exiting..');
    }

    app.quit();
    return;
  }

  createWindow();
});

app.on('before-quit', () => {
  try {
    encryptDB();
    cleanupTemp();
    console.log('Encrypted DB');
  } catch (err) {
    console.error('Failed to encrypt DB before quitting:', err);
  }
});

process.on('SIGTERM', cleanupTemp);
process.on('SIGINT', cleanupTemp);
process.on('exit', cleanupTemp);

app.on('window-all-closed', () => {
  app.quit();
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
