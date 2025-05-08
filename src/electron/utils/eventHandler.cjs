const { db } = require('./initData.cjs');
const { defaultEncrypt, defaultDecrypt, generateKey, separateIV } = require('./encryption.cjs');
const { hashPassword, comparePassword, mapPasswordData } = require('./helper.cjs');
const { clipboard } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const SYSTEM_PASSWORD_KEY = 'system';
const SYSTEM_TOKEN_KEY = 'token';
const SYSTEM_RECOVERY_KEY = 'recover';

async function createEmailAccount(event, email, password) {
  try {
    const encrypted = defaultEncrypt(password);
    const statement = db.prepare('INSERT INTO email_accounts (email, encrypted_password) VALUES (?, ?)');
    const info = statement.run(email, encrypted);
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
  try {
    const statement = db.prepare('SELECT * FROM email_accounts');
    const data = statement.all();

    const mapped = data.map(mapPasswordData);
    return mapped;
  }
  catch (err) {
    console.log(err);
    return [];
  }
}

async function getAllServiceAccounts(event, linkedEmailId = undefined) {
  try {
    if (typeof linkedEmailId === "number") {
      const statement = db.prepare('SELECT * FROM service_accounts WHERE email_id = ?');
      const data = statement.all(linkedEmailId);
      return data;
    }

    const statement = db.prepare('SELECT * FROM service_accounts');
    const data = statement.all();
    return data;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

async function getAllServices(event) {
  try {
    // TODO:
    const statement = db.prepare(`
      SELECT services.*, s.count FROM services
      JOIN (
        SELECT service_id, COUNT(*) AS count
          FROM service_accounts
        GROUP BY service_id
      ) AS s ON s.service_id = services.id
    `);
  }
  catch (err) {
    console.log(err);
  }
}

async function editEmailAccount(event, emailId, newPassword) {
  // TODO:
  try {
    const encrypted = defaultEncrypt(newPassword);
    const statement = db.prepare('UPDATE email_accounts SET encrypted_password = ? WHERE id = ?');

    const info = statement.run(encrypted, emailId);
    return info;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

async function deleteEmailAccount(event, emailId) {
  try {
    const statement = db.prepare('DELETE FROM email_accounts WHERE id = ?');
    const info = statement.run(emailId);

    return info;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

async function deleteAllData() {
  const query = fs.readFileSync(path.resolve(__dirname, 'delete.sql'), 'utf8');
  db.exec(query);
}

async function getSystemPassword(event) {
  const statement = db.prepare("SELECT * FROM keys WHERE used_in = ?");

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
  const token = generateKey();
  const encryptedToken = defaultEncrypt(token);
  const { IV, encrypted: recoverToken } = separateIV(encryptedToken, true);
  const statement = db.prepare("INSERT INTO keys (used_in, key_string) VALUES (@keyName, @data)");

  const data = [
    { keyName: SYSTEM_PASSWORD_KEY, data: hashed },
    { keyName: SYSTEM_TOKEN_KEY, data: token },
    { keyName: SYSTEM_RECOVERY_KEY, data: recoverToken }
  ];
  const insert = db.transaction((arr) => {
    for (const item of arr) statement.run(item);
  });

  insert(data);
  return IV;
}

async function verifyPassword(event, password) {
  const statement = db.prepare('SELECT * FROM keys WHERE used_in == ?');
  const data = statement.get(SYSTEM_PASSWORD_KEY);
  const hashedPassword = data["key_string"];

  const isMatched = comparePassword(password, hashedPassword);
  return isMatched;
}

async function requestDecryptedPassword(event, encryptedPassword, request) {
  try {
    const decrypted = defaultDecrypt(encryptedPassword);

    switch(request) {
      case 'get':
        return decrypted;
      case 'copy':
        clipboard.writeText(decrypted);
        return true;
    }
  }
  catch (err) {
    console.log(err);
    switch(request) {
      case 'show':
        return '';
      case 'copy':
        return false;
    }
  }
}

async function getBackupData(event) {
  // TODO:
}

module.exports = {
  createEmailAccount,
  createServiceAccount,
  getAllEmailAccounts,
  getAllServices,
  getAllServiceAccounts,
  editEmailAccount,
  deleteEmailAccount,
  deleteAllData,
  getSystemPassword,
  verifyPassword,
  requestDecryptedPassword,
  getBackupData,
  storePassword,
}