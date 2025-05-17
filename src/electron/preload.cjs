const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});

contextBridge.exposeInMainWorld('db', {
  createEmailAccount: (email, password) =>
    ipcRenderer.invoke('db:create-email-acc', email, password),
  createServiceAccount: (serviceId, emailId, username, password, oAuthProvider) =>
    ipcRenderer.invoke('db:create-service-acc', serviceId, emailId, username, password, oAuthProvider),
  createService: (serviceName, domain, description) =>
    ipcRenderer.invoke('db:create-service', serviceName, domain, description),
  getAllEmailAccounts: () =>
    ipcRenderer.invoke('db:get-all-email-accs'),
  getEmailAccount: (email) =>
    ipcRenderer.invoke('db:get-email-account', email),
  getAllServices: () =>
    ipcRenderer.invoke('db:get-all-services'),
  getAllServiceAccounts: (linkedEmailId) =>
    ipcRenderer.invoke('db:get-all-service-accs', linkedEmailId),
  getServiceAccount: (serviceId, username, emailId, subaddress) =>
    ipcRenderer.invoke('db:get-service-account', serviceId, username, emailId, subaddress),
  getOAuthProviders: () =>
    ipcRenderer.invoke('db:get-oauth-providers'),
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
