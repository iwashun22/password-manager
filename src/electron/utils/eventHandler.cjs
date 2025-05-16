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

async function getEmailAccount(event, email) {
  try {
    let data = undefined;
    if (typeof email === 'number') {
      const statement = db.prepare('SELECT * FROM email_accounts WHERE id = ?');
      data = statement.get(email);
    }
    else {
      const statement = db.prepare('SELECT * FROM email_accounts WHERE email = ?');
      data = statement.get(email);
    }

    return data === undefined ? undefined : mapPasswordData(data);
  }
  catch (err) {
    console.log(err);
    return undefined;
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
    const statement = db.prepare(`
      SELECT services.*, s.count FROM services
      JOIN (
        SELECT service_id, COUNT(*) AS count
          FROM service_accounts
        GROUP BY service_id
      ) AS s ON s.service_id = services.id
    `);
    const data = statement.all();
    return data;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

async function createService(event, serviceName, domain, description) {
  try {
    const fetchUrl = `https://www.google.com/s2/favicons?domain=${domain}`;
    const response = await fetch(fetchUrl);
    // if (!response.ok) {

    // }
    const arrayBuffer = response.arrayBuffer();
    return arrayBuffer;
  }
  catch (err) {
    return -1;
  }
}

async function getOAuthProviders() {
  try {
    const statement = db.prepare(`
      SELECT oauth_provider FROM service_accounts
      GROUP BY oauth_provider
    `);
    const data = statement.all();
    return data.map(d => d['oauth_provider']);
  }
  catch (err) {
    console.log(err);
    return [];
  }
}

async function editEmailAccount(event, emailId, newPassword) {
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
      case 'get':
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
  createService,
  getAllEmailAccounts,
  getEmailAccount,
  getAllServices,
  getAllServiceAccounts,
  getOAuthProviders,
  editEmailAccount,
  deleteEmailAccount,
  deleteAllData,
  getSystemPassword,
  verifyPassword,
  requestDecryptedPassword,
  getBackupData,
  storePassword,
}