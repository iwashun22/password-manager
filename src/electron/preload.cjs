const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});

contextBridge.exposeInMainWorld('db', {
  createEmailAccount: (email, password) =>
    ipcRenderer.invoke('db:create-email-acc', email, password),
  createServiceAccount: (...args) =>
    ipcRenderer.invoke('db:create-service-acc', ...args),
  createService: (serviceName, domain, description) =>
    ipcRenderer.invoke('db:create-service', serviceName, domain, description),
  getAllEmailAccounts: () =>
    ipcRenderer.invoke('db:get-all-email-accs'),
  getEmailAccount: (email) =>
    ipcRenderer.invoke('db:get-email-account', email),
  getAllServices: (id) =>
    ipcRenderer.invoke('db:get-all-services', id),
  getServiceAccountsLinkedToEmail: (linkedEmailId) =>
    ipcRenderer.invoke('db:get-service-accs-linked-to-email', linkedEmailId),
  getServiceAccount: (...args) =>
    ipcRenderer.invoke('db:get-service-account', ...args),
  getServiceAccountsById: (id, id_type) => 
    ipcRenderer.invoke('db:get-service-accs-by-id', id, id_type),
  getOAuthProviders: () =>
    ipcRenderer.invoke('db:get-oauth-providers'),
  editEmailAccount: (emailId, newPassword) =>
    ipcRenderer.invoke('db:edit-email-acc', emailId, newPassword),
  deleteEmailAccount: (emailId) =>
    ipcRenderer.invoke('db:delete-email-acc', emailId),
  deleteServiceAccount: (serviceId) =>
    ipcRenderer.invoke('db:delete-service-acc', serviceId),
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
  retryFetchFavicon: (serviceId, domain) =>
    ipcRenderer.invoke('user:retry-fetch-favicon', serviceId, domain),
  formattingEmail: (emailId, subaddress) =>
    ipcRenderer.invoke('user:formatting-email', emailId, subaddress),
  saveDatabase: () =>
    ipcRenderer.invoke('user:save-database'),
});

contextBridge.exposeInMainWorld('backup', {
  getBackupData: () =>
    ipcRenderer.invoke('backup:get-backup-data'),
});
