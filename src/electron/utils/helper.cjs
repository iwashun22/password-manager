const bcrypt = require('bcrypt');
const { app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { generate24BytesKey, defaultDecrypt, defaultEncrypt } = require('./encryption.cjs');

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
    const genKey = generate24BytesKey();
    const { iv, encrypted } = defaultEncrypt(genKey);
    const secret = iv + encrypted;
    fs.writeFileSync(keyPath, secret, 'utf8');
    return Buffer.from(genKey, 'base64');
  }

  const secret = fs.readFileSync(keyPath, 'utf8');
  const iv = secret.slice(0, 24);
  const encrypted = secret.slice(24);
  const key = defaultDecrypt({ iv, encrypted });
  return Buffer.from(key, 'base64');
}

module.exports = {
  hashPassword,
  comparePassword,
  getOrCreateKey,
}