const { db } = require('./initData.cjs');
const { getEncryptionKey } = require('./encryption.cjs');

const SYSTEM_PASSWORD_KEY = 'system';

async function createEmailAccount(event, email, encryptedPassword) {
  try {
    const statement = db.prepare('INSERT INTO emails (email, encrypted_password) VALUES (?, ?)');
    const info = statement.run(email, encryptedPassword);
    return info;
  }
  catch (err) {
    console.log(err);
  }
}

async function createServiceAccount(event, emailId, username, encryptedPassword) {
  // TODO:
}

async function getAllEmailAccounts() {
  const statement = db.prepare('SELECT * FROM email_accounts');
  const data = statement.all();
  return data;
}

async function editEmailAccount(event, emailId, encryptedPassword) {
  // TODO:
}

async function getSystemPassword(event) {
  const statement = db.prepare("SELECT * FROM passwords WHERE used_in == ?");
  const data = statement.get(SYSTEM_PASSWORD_KEY);
  return data;
}

async function getBackupData() {
  // TODO:
}

module.exports = {
  createEmailAccount,
  createServiceAccount,
  getAllEmailAccounts,
  editEmailAccount,
  getSystemPassword,
  getBackupData
}