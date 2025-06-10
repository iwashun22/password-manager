const { db } = require('./initData.cjs');
const { defaultEncrypt, defaultDecrypt, generateKey, separateIV } = require('./encryption.cjs');
const { hashPassword, comparePassword, mapPasswordData, faviconUrl } = require('./helper.cjs');
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

async function getEmailAccount(event, emailId) {
  try {
    let data = undefined;
    if (typeof emailId === 'number') {
      const statement = db.prepare('SELECT * FROM email_accounts WHERE id = ?');
      data = statement.get(emailId);
    }
    else {
      const statement = db.prepare('SELECT * FROM email_accounts WHERE email = ?');
      data = statement.get(emailId);
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
  // TODO:
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
  requestDecryptedPassword,
  getBackupData,
  storePassword,
  retryFetchFavicon,
  formattingEmail,
}