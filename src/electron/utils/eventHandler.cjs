const { db } = require('./initData.cjs');
const { defaultEncrypt, generate24BytesKey } = require('./encryption.cjs');
const { hashPassword } = require('./helper.cjs');

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

async function getSystemPassword(event) {
  const statement = db.prepare("SELECT * FROM passwords WHERE used_in == ?");
  const data = statement.get(SYSTEM_PASSWORD_KEY);
  return data;
}

async function storePassword(event, password) {
  const hashed = hashPassword(password);
  const token = generate24BytesKey();
  const { encrypted, iv } = defaultEncrypt(token);
  const statement = db.prepare("INSERT INTO passwords (used_in, hashed_password) VALUES (@keyName, @data)");

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

async function getBackupData(event) {
  // TODO:
}

module.exports = {
  createEmailAccount,
  createServiceAccount,
  getAllEmailAccounts,
  editEmailAccount,
  getSystemPassword,
  getBackupData,
  storePassword,
}