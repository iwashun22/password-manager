const bcrypt = require('bcrypt');
const { app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { generateKey, defaultDecrypt, defaultEncrypt } = require('./encryption.cjs');

function hashPassword(plainText) {
  const saltRound = 10;
  const salt = bcrypt.genSaltSync(saltRound);
  const hash = bcrypt.hashSync(plainText, salt);
  return hash;
}

function comparePassword(password, hashed) {
  return bcrypt.compareSync(password, hashed);
}

function getOrCreateKey(forceCreate = false) {
  const keyPath = path.join(app.getPath('userData'), 'key');

  if (forceCreate) {
    fs.rmSync(keyPath);
  }

  if (!fs.existsSync(keyPath)) {
    const genKey = generateKey();
    const encryptedKey = defaultEncrypt(genKey);
    fs.writeFileSync(keyPath, encryptedKey, 'utf8');
    return encryptedKey;
  }

  const secret = fs.readFileSync(keyPath, 'utf8');
  const key = defaultDecrypt(secret);
  return Buffer.from(key, 'base64');
}

function mapPasswordData(data) {
  const decrypted = defaultDecrypt(data['encrypted_password']);
  return {
    ...data,
    password_length: decrypted.length
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  getOrCreateKey,
  mapPasswordData
}