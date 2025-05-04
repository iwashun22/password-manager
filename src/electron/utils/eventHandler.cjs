const { db } = require('./initData.cjs');
const { defaultEncrypt, generate24BytesKey } = require('./encryption.cjs');
const { hashPassword, comparePassword } = require('./helper.cjs');
const fs = require('node:fs');
const path = require('node:path');

const SYSTEM_PASSWORD_KEY = 'system';
const SYSTEM_TOKEN_KEY = 'token';
const SYSTEM_RECOVERY_KEY = 'recover';

async function createEmailAccount(event, email, password) {
  try {
    const { iv, encrypted } = defaultEncrypt(password);
    const statement = db.prepare('INSERT INTO emails (email, encrypted_password, iv_password) VALUES (?, ?, ?)');
    const info = statement.run(email, encrypted, iv);
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

async function deleteAllData() {
  const query = fs.readFileSync(path.resolve(__dirname, 'delete.sql'), 'utf8');
  db.exec(query);
}

async function getSystemPassword(event) {
  const statement = db.prepare("SELECT * FROM keys WHERE used_in == ?");

  const passwordData = statement.get(SYSTEM_PASSWORD_KEY);
  const tokenData = statement.get(SYSTEM_TOKEN_KEY);
  const recoveryData = statement.get(SYSTEM_RECOVERY_KEY);

  if (!passwordData && (tokenData || recoveryData)) {
    throw new Error('Detected security issue: Password has been removed manually while other sensitive keys still exist.');
  }
  return passwordData;
}

async function storePassword(event, password) {
  const hashed = hashPassword(password);
  const token = generate24BytesKey();
  const { encrypted, iv } = defaultEncrypt(token);
  const statement = db.prepare("INSERT INTO keys (used_in, key_string) VALUES (@keyName, @data)");

  const data = [
    { keyName: SYSTEM_PASSWORD_KEY, data: hashed },
    { keyName: SYSTEM_RECOVERY_KEY, data: encrypted },
    { keyName: SYSTEM_TOKEN_KEY, data: token }
  ];
  const insert = db.transaction((arr) => {
    for (const item of arr) statement.run(item);
  });

  insert(data);
  return iv;
}

async function verifyPassword(event, password) {
  const statement = db.prepare('SELECT * FROM keys WHERE used_in == ?');
  const data = statement.get(SYSTEM_PASSWORD_KEY);
  const hashedPassword = data["key_string"];

  const isMatched = comparePassword(password, hashedPassword);
  return isMatched;
}

async function getBackupData(event) {
  // TODO:
}

module.exports = {
  createEmailAccount,
  createServiceAccount,
  getAllEmailAccounts,
  editEmailAccount,
  deleteAllData,
  getSystemPassword,
  verifyPassword,
  getBackupData,
  storePassword,
}