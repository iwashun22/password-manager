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
  editService: (serviceId, ...args) =>
    ipcRenderer.invoke('db:edit-service', serviceId, ...args),
  editServiceAccount: (accountId, ...args) =>
    ipcRenderer.invoke('db:edit-service-acc', accountId, ...args),
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
  updatePassword: (password) =>
    ipcRenderer.invoke('user:update-password', password),
  verifyPassword: (password) =>
    ipcRenderer.invoke('user:verify-password', password),
  verifyRecoveryKey: (key) =>
    ipcRenderer.invoke('user:verify-recovery-key', key),
  requestDecryptedPassword: (encryptedPassword, request) =>
    ipcRenderer.invoke('user:request-decrypted-password', encryptedPassword, request),
  retryFetchFavicon: (serviceId, domain) =>
    ipcRenderer.invoke('user:retry-fetch-favicon', serviceId, domain),
  formattingEmail: (emailId, subaddress) =>
    ipcRenderer.invoke('user:formatting-email', emailId, subaddress),
  saveDatabase: () =>
    ipcRenderer.invoke('user:save-database'),
  openExternalLink: (url) =>
    ipcRenderer.invoke('user:open-external-link', url)
});

contextBridge.exposeInMainWorld('backup', {
  getBackupData: (recoveryKey) =>
    ipcRenderer.invoke('backup:get-backup-data', recoveryKey),
  loadBackupData: (data, recoveryKey) =>
    ipcRenderer.invoke('backup:load-backup-data', data, recoveryKey),
  loadEachService: (json) =>
    ipcRenderer.invoke('backup:load-each-service', json),
  checkKeySize: (keyString) =>
    ipcRenderer.invoke('backup:check-key-size', keyString)
});
