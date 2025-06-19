const { db } = require('./initData.cjs');
const { defaultEncrypt, defaultDecrypt, encrypt, decrypt, generateKey, separateIV, checkRecoveryKeySize } = require('./encryption.cjs');
const { hashPassword, comparePassword, mapPasswordData, faviconUrl, passwordAttemptStamp, clearAllAttempts } = require('./helper.cjs');
const { clipboard } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const SYSTEM_PASSWORD_KEY = 'system';
const SYSTEM_TOKEN_KEY = 'token';
const SYSTEM_RECOVERY_KEY = 'recover';
const SYSTEM_LOCKED = 'locked';

async function createEmailAccount(event, email, password) {
  try {
    const encrypted = defaultEncrypt(password);
    const statement = db.prepare('INSERT INTO email_accounts (email, encrypted_password) VALUES (?, ?)');
    const info = statement.run(email, encrypted);
    return info;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

async function createServiceAccount(event, serviceId, emailId, subaddress, username, password, oAuthProvider) {
  try {
    const encrypted = password ? defaultEncrypt(password) : '';
    const statement =  db.prepare(`
      INSERT INTO service_accounts
      (service_id, email_id, subaddress, username, encrypted_password, oauth_provider)
      VALUES
      (?, ?, ?, ?, ?, ?)
      `);
    const info = statement.run(serviceId, emailId, subaddress || '', username, encrypted, oAuthProvider || '');

    return info;
  }
  catch (err) {
    console.log(err);
    return null;
  }
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

async function getServiceAccountsLinkedToEmail(event, linkedEmailId = undefined) {
  try {
    if (typeof linkedEmailId === "number") {
      const statement = db.prepare('SELECT * FROM service_accounts WHERE email_id = ?');
      const data = statement.all(linkedEmailId);
      const mapped = data.map(mapPasswordData);
      return mapped;
    }

    const statement = db.prepare('SELECT * FROM service_accounts');
    const data = statement.all();
    const mapped = data.map(mapPasswordData);
    return mapped;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

async function getServiceAccountsById(event, id, id_type) {
  try {
    let statement;
    switch(id_type) {
      case 'email':
        statement = db.prepare('SELECT * FROM service_accounts WHERE email_id = ?');
        break;
      case 'service':
        statement = db.prepare('SELECT * FROM service_accounts WHERE service_id = ?');
        break;
      case 'account':
        statement = db.prepare('SELECT * FROM service_accounts WHERE id = ?');
        break;
      default:
        throw new Error('Invalid id_type provided');
    }

    const data = statement.all(id);
    const mapped = data.map(mapPasswordData);
    return mapped;
  }
  catch(err) {
    console.log(err);
    return null;
  }
}

async function getServiceAccount(event, serviceId, username, emailId, subaddress, oauthProvider) {
  try {
    const emailIsNull = emailId === null;
    const data = emailIsNull ?
      db.prepare(`
        SELECT * FROM service_accounts
        WHERE service_id = ? AND username = ? AND email_id IS NULL
      `).get(serviceId, username) :
      db.prepare(`
        SELECT * FROM service_accounts
        WHERE service_id = ? AND email_id = ? AND subaddress = ? AND oauth_provider = ?
      `).get(serviceId, emailId, subaddress || '', oauthProvider || '');

    // undefined will be returned if there is no data
    return data;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

async function getAllServices(event, id = undefined) {
  try {
    if (typeof id === 'number') {
      const statement = db.prepare(`
        SELECT services.*, IFNULL(s.count, 0) FROM services
        LEFT JOIN (
          SELECT service_id, COUNT(*) AS count
          FROM service_accounts
          GROUP BY service_id
        ) AS s ON s.service_id = services.id
        WHERE id = ?
      `)
      const data = statement.get(id);
      return data;
    }

    const statement = db.prepare(`
      SELECT services.*, IFNULL(s.count, 0) AS count FROM services
      LEFT JOIN (
        SELECT service_id, COUNT(*) AS count
        FROM service_accounts
        GROUP BY service_id
      ) AS s ON s.service_id = services.id
      ORDER BY services.service_name COLLATE NOCASE
    `);

    const data = statement.all();
    const filtered = data.filter(v => v.count >= 1);

    const removeUnusedService = db.prepare(`
      DELETE FROM services
      WHERE id = ?
    `)
    const del = db.transaction((arr) => {
      for (const item of arr) {
        if (item['count'] < 1) removeUnusedService.run(item['id']);
      }
    });
    del(data);

    return filtered;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

async function createService(event, serviceName, domain, description) {
  const statement = db.prepare(`
    INSERT INTO services (service_name, domain_name, description_text, favicon_png)
    VALUES (?, ?, ?, ?)
  `);

  try {
    const fetchUrl = faviconUrl(domain);
    const iconResponse = await fetch(fetchUrl);
    const arrayBuffer = iconResponse.ok ? await iconResponse.arrayBuffer() : null;
    const buffer = arrayBuffer ? Buffer.from(arrayBuffer) : null;

    const info = statement.run(serviceName, domain, description, buffer);
    return info;
  }
  catch (err) {
    console.log(err);

    try {
      const info = statement.run(serviceName, domain, description, null);
      return info;
    }
    catch(err) {
      console.log(err);
      return null;
    }
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

async function editService(event, serviceId, serviceName, domainName, description) {
  try {
    const statement = db.prepare(`
      UPDATE services
      SET service_name = ?, domain_name = ?, description_text = ?
      WHERE id = ?
    `);
    const info = statement.run(serviceName, domainName, description, serviceId);

    await retryFetchFavicon(undefined, serviceId, domainName, true);
    return info;
  }
  catch(err) {
    console.log(err);
    return null;
  }
}

async function editServiceAccount(event, accountId, serviceId, username, emailId, subaddress, password) {
  try {
    const serviceAccountEmailExist = await getServiceAccount(null, serviceId, '', emailId, subaddress, null);
    const serviceAccountUsernameExist = await getServiceAccount(null, serviceId, username, null, null, null);

    for (
      const acc of [serviceAccountEmailExist, serviceAccountUsernameExist]
    )
    {
      if (acc && acc.id !== accountId) return acc;
    }

    const statement = db.prepare(`
      UPDATE service_accounts
      SET username = ?, email_id = ?, subaddress = ?, encrypted_password = ?
      WHERE id = ?
    `);
    const encrypted = defaultEncrypt(password);

    const info = statement.run(username, emailId, subaddress || '', encrypted, accountId);
    return info;
  }
  catch(err) {
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

async function deleteServiceAccount(event, serviceId) {
  try {
    const statement = db.prepare('DELETE FROM service_accounts WHERE id = ?');
    const info = statement.run(serviceId);

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
  try {
    const hashed = hashPassword(password);
    const token = generateKey();
    const randomKey = Buffer.from(generateKey(), 'base64');
    const encryptedToken = encrypt(token, randomKey);
    const { IV, encrypted: recoverToken } = separateIV(encryptedToken, false);
    const recoveryKey = Buffer.concat([IV, randomKey]).toString('base64');

    const statement = db.prepare("INSERT INTO keys (used_in, key_string) VALUES (@keyName, @data)");

    const now = Date.now();
    const initialLockData = defaultEncrypt(`0::${now}`);

    const data = [
      { keyName: SYSTEM_PASSWORD_KEY, data: hashed },
      { keyName: SYSTEM_TOKEN_KEY, data: token },
      { keyName: SYSTEM_RECOVERY_KEY, data: recoverToken.toString('base64') },
      { keyName: SYSTEM_LOCKED, data: initialLockData },
    ];
    const insert = db.transaction((arr) => {
      for (const item of arr) statement.run(item);
    });

    insert(data);
    return recoveryKey;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

async function updatePassword(event, password) {
  try {
    const hashed = hashPassword(password);
    const statement = db.prepare(`
      UPDATE keys
      SET key_string = ?
      WHERE used_in = ?
    `);
    const info = statement.run(hashed, SYSTEM_PASSWORD_KEY);
    const encrypted = defaultEncrypt('0::0');
    statement.run(encrypted, SYSTEM_LOCKED);
    clearAllAttempts();
    return info;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}


async function verifyPassword(event, password) {
  let currentTimeout = 0;

  try {
    const statement = db.prepare('SELECT * FROM keys WHERE used_in = ?');
    const lockedData = statement.get(SYSTEM_LOCKED);

    if (lockedData === undefined) {
      const insert = db.prepare('INSERT INTO keys (used_in, key_string) VALUES (?, ?)');
      insert.run(SYSTEM_LOCKED, '');
      throw new Error('The column was deleted');
    }
    else {
      const decrypted = defaultDecrypt(lockedData["key_string"]);
      const format = decrypted.split("::");

      currentTimeout = format[0] ? Number(format[0]) : 0;
      const waitUntil = format[1] ? Number(format[1]) : 0;
      const now = Date.now();

      if (now < waitUntil) {
        passwordAttemptStamp(true);
        const secondGap = Math.ceil(Math.abs(waitUntil - now) / 1000);

        if (secondGap > 1) return secondGap;
      }
    }
  }
  catch (err) {
    const stmt = db.prepare(`
      UPDATE keys SET key_string = ?
      WHERE used_in = ?
    `);
    const WAITING_TIME = 30;
    const enableWhen = Date.now() + (WAITING_TIME * 1000);
    const encrypted = defaultEncrypt(`${WAITING_TIME}::${enableWhen}`);
    stmt.run(encrypted, SYSTEM_LOCKED);

    return WAITING_TIME;
  }

  const statement = db.prepare('SELECT * FROM keys WHERE used_in = ?');
  const data = statement.get(SYSTEM_PASSWORD_KEY);
  const hashedPassword = data["key_string"];

  const isMatched = comparePassword(password, hashedPassword);

  const lockStatement = db.prepare(`
    UPDATE keys SET key_string = ?
    WHERE used_in = ?
  `);

  if (!isMatched) {
    const attempts = currentTimeout > 0 ?
      passwordAttemptStamp(true) : passwordAttemptStamp();
    if (attempts.length >= 5) {
      currentTimeout += 30;
      const waitUntilNext = Date.now() + (currentTimeout * 1000);
      const encrypted = defaultEncrypt(`${currentTimeout}::${waitUntilNext}`);
      lockStatement.run(encrypted, SYSTEM_LOCKED);
      return currentTimeout;
    }
  }
  else {
    const encrypted = defaultEncrypt('0::0');
    lockStatement.run(encrypted, SYSTEM_LOCKED);
    clearAllAttempts();
  }
  return isMatched;
}

async function verifyRecoveryKey(event, recoveryKey) {
  try {
    const { IV, encrypted: randomKey} = separateIV(recoveryKey, false);
    const statement = db.prepare('SELECT * FROM keys WHERE used_in = ?');
    const token = statement.get(SYSTEM_TOKEN_KEY);
    const recoveryToken = statement.get(SYSTEM_RECOVERY_KEY);

    const recoveryTokenBuffer = Buffer.from(recoveryToken["key_string"], "base64");
    const encrypted = Buffer.concat([IV, recoveryTokenBuffer]);
    const decrypted = decrypt(encrypted, randomKey);
    const tokenKey = Buffer.from(decrypted, "base64");

    const tokenBuffer = Buffer.from(token["key_string"], "base64");
    return Buffer.compare(tokenKey, tokenBuffer) === 0;
  }
  catch (err) {
    console.log(err);
    return false;
  }
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

async function formattingEmail(event, emailId, subaddress) {
  try {
    const emailData = await getEmailAccount(null, emailId);
    if (emailData === undefined) {
      throw new Error('Email account not found');
    }

    const [name, domain] = emailData.email.split('@');
    const formattedEmail = subaddress ? `${name}+${subaddress}@${domain}` : emailData.email;
    return formattedEmail;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

async function retryFetchFavicon(event, serviceId, domain, override = false) {
  const statement = db.prepare(`
    UPDATE services
    SET favicon_png = ?
    WHERE id = ?
  `);

  try {
    const fetchUrl = faviconUrl(domain);
    const iconResponse = await fetch(fetchUrl);
    const arrayBuffer = iconResponse.ok ? await iconResponse.arrayBuffer() : null;
    const buffer = arrayBuffer ? Buffer.from(arrayBuffer) : null;

    if (!buffer) {
      throw new Error('Failed to fetch favicon');
    }

    statement.run(buffer, serviceId);

    return buffer;
  }
  catch (err) {
    console.log(err);
    if (override) {
      statement.run(null, serviceId);
    }
    return null;
  }
}

async function getBackupData(event) {
  try {
    const servicesData = db.prepare('SELECT * FROM services').all();
    const emailsData = db.prepare('SELECT * FROM email_accounts').all();
    const accountsData = db.prepare('SELECT * FROM service_accounts').all();
    const recoverToken = db.prepare('SELECT * FROM keys WHERE used_in = ?').get(SYSTEM_RECOVERY_KEY);
    const encryptionKey = db.prepare('SELECT * FROM keys WHERE used_in = ?').get(SYSTEM_TOKEN_KEY);
    const password = db.prepare('SELECT * FROM keys WHERE used_in = ?').get(SYSTEM_PASSWORD_KEY);

    if (!password["key_string"]) {
      throw new Error('no password found');
    }

    const emailMap = new Map(emailsData.map(v => [v.id, v.email]));
    const mappedAccounts = accountsData.map(v => {
      const email = emailMap.get(v.email_id) || '';
      const password = v.encrypted_password ? defaultDecrypt(v.encrypted_password) : '';
      delete v.encrypted_password;
      return {
        ...v,
        "email": email,
        "password": password
      }
    });

    const serviceAccounts = servicesData.map(s => {
      const accounts = mappedAccounts.filter(acc => acc.service_id === s.id);
      return {
        ...s,
        "accounts": accounts
      }
    });

    const formatted = {
      "emails": emailsData.map(email => {
        const password = email.encrypted_password ? defaultDecrypt(email.encrypted_password) : '';
        delete email.encrypted_password;
        return {
          ...email,
          "password": password
        }
      }),
      "services": serviceAccounts,
      "password": password["key_string"],
    }
    const jsonString = JSON.stringify(formatted);
    const keyBuffer = Buffer.from(encryptionKey["key_string"], 'base64');
    const encrypted = encrypt(jsonString, keyBuffer);
    return recoverToken["key_string"] + '\n' + encrypted;
  }
  catch(err) {
    console.log(err);
    return null;
  }
}

async function loadBackupData(event, data, recoveryKey) {
  let json;
  try {
    const [recoverToken, encryptedJson] = data.split('\n');
    const recoverTokenBuffer = Buffer.from(recoverToken, "base64");
    const { IV, encrypted: randomKey } = separateIV(recoveryKey, false);
    const key = decrypt(Buffer.concat([IV, recoverTokenBuffer]), randomKey);
    const jsonString = decrypt(encryptedJson, Buffer.from(key, "base64"));
    json = JSON.parse(jsonString);

    const insert = db.prepare('INSERT INTO keys (used_in, key_string) VALUES (@key, @value)');
    const bulkCreate = db.transaction((arr) => {
      for (const item of arr) insert.run(item);
    });
    const initialLockData = defaultEncrypt(`0::${Date.now()}`);
    bulkCreate([
      { key: SYSTEM_TOKEN_KEY, value: key },
      { key: SYSTEM_RECOVERY_KEY, value: recoverToken },
      { key: SYSTEM_LOCKED, value: initialLockData }
    ]);
  }
  catch (err) {
    console.log(err);
    return null;
  }

  db.prepare('INSERT INTO keys (used_in, key_string) VALUES (?, ?)')
    .run(SYSTEM_PASSWORD_KEY, json["password"]);
  const emailMap = new Map();

  for (const email of json["emails"]) {
    const info = await createEmailAccount(undefined, email["email"], email["password"]);
    if (info === null) {
      const existingEmail = await getEmailAccount(undefined, email["email"]);
      if (existingEmail) {
        emailMap.set(existingEmail.email, existingEmail.id);
      }
    }
    else {
      emailMap.set(email["email"], info.lastInsertRowid);
    }
  }

  const mapped = json["services"].map(service => {
    const accounts = service["accounts"].map(account => {
      const emailId = emailMap.get(account["email"]) || null;
      const encryptedPassword = account["password"] ? defaultEncrypt(account["password"]) : '';
      delete account["email"];
      delete account["password"];

      return {
        ...account,
        "encrypted": encryptedPassword,
        "email_id": emailId,
      }
    })

    return {
      ...service,
      "accounts": accounts
    }
  });

  return mapped;
}

async function loadEachService(event, json) {
  const info = await createService(undefined, json["service_name"], json["domain_name"], json["description_text"]);

  if (!info) throw new Error('Failed creating a service');

  const id = info.lastInsertRowid;

  const success = [];
  for (const account of json["accounts"]) {
    try {
      const decrypted = account["encrypted"] ? defaultDecrypt(account["encrypted"]) : '';
      const info = await createServiceAccount(undefined, id, account["email_id"], account["subaddress"], account["username"], decrypted, account["oauth_provider"]);

      if (info) success.push(info);
    }
    catch (err) {
      console.log(err);
      continue;
    }
  }

  return json["accounts"].length === success.length;
}

async function checkKeySize(event, keyString) {
  try {
    return checkRecoveryKeySize(keyString);
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

module.exports = {
  createEmailAccount,
  createServiceAccount,
  createService,
  getAllEmailAccounts,
  getEmailAccount,
  getAllServices,
  getServiceAccountsLinkedToEmail,
  getServiceAccount,
  getServiceAccountsById,
  getOAuthProviders,
  editEmailAccount,
  editService,
  editServiceAccount,
  deleteEmailAccount,
  deleteServiceAccount,
  deleteAllData,
  getSystemPassword,
  verifyPassword,
  verifyRecoveryKey,
  requestDecryptedPassword,
  storePassword,
  updatePassword,
  retryFetchFavicon,
  formattingEmail,
  getBackupData,
  loadBackupData,
  loadEachService,
  checkKeySize
}