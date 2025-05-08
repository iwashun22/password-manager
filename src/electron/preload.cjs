const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});

contextBridge.exposeInMainWorld('db', {
  createEmailAccount: (email, password) =>
    ipcRenderer.invoke('db:create-email-acc', email, password),
  createServiceAccount: (emailId, username, password) =>
    ipcRenderer.invoke('db:create-service-acc', emailId, username, password),
  getAllEmailAccounts: () =>
    ipcRenderer.invoke('db:get-all-email-accs'),
  getAllServices: () =>
    ipcRenderer.invoke('db:get-all-services'),
  getAllServiceAccounts: (linkedEmailId) =>
    ipcRenderer.invoke('db:get-all-service-accs', linkedEmailId),
  editEmailAccount: (emailId, newPassword) =>
    ipcRenderer.invoke('db:edit-email-acc', emailId, newPassword),
  deleteEmailAccount: (emailId) =>
    ipcRenderer.invoke('db:delete-email-acc', emailId),
  deleteAllData: () =>
    ipcRenderer.invoke('db:delete-all-data'),
});

contextBridge.exposeInMainWorld('user', {
  getSystemPassword: () =>
    ipcRenderer.invoke('user:get-system-pw'),
  storePassword: (password) =>
    ipcRenderer.invoke('user:store-password', password),
  verifyPassword: (password) =>
    ipcRenderer.invoke('user:verify-password', password),
  requestDecryptedPassword: (encryptedPassword, request) =>
    ipcRenderer.invoke('user:request-decrypted-password', encryptedPassword, request),
});

contextBridge.exposeInMainWorld('backup', {
  getBackupData: () =>
    ipcRenderer.invoke('backup:get-backup-data'),
});
