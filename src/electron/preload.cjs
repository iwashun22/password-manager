const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});

contextBridge.exposeInMainWorld('db', {
  createEmailAccount: (email, encryptedPassword) =>
    ipcRenderer.invoke('db:create-email-acc', email, encryptedPassword),
  createServiceAccount: (emailId, username, encryptedPassword) =>
    ipcRenderer.invoke('db:create-service-acc', emailId, username, encryptedPassword),
  getAllEmailAccounts: () =>
    ipcRenderer.invoke('db:get-all-email-accs'),
  getAllServiceAccounts: () =>
    ipcRenderer.invoke('db:get-all-service-accs'),
  editEmailAccount: (emailId, encryptedPassword) =>
    ipcRenderer.invoke('db:edit-email-acc', emailId, encryptedPassword),
});

contextBridge.exposeInMainWorld('user', {
  getSystemPassword: () =>
    ipcRenderer.invoke('user:get-system-pw'),
});

contextBridge.exposeInMainWorld('backup', {
  getBackupData: () =>
    ipcRenderer.invoke('backup:get-backup-data'),
});