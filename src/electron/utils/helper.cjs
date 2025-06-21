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

function mapPasswordData(data) {
  const columnName = 'encrypted_password';
  const decrypted = data[columnName] !== '' ?
    defaultDecrypt(data[columnName]) : '';

  return {
    ...data,
    password_length: decrypted.length
  }
}

function faviconUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}`;
}

const passwordAttempts = [];
const REMEMBER_LAST_ATTEMP = 20 * 1000; // 20 seconds
const MAX_ATTEMPTS = 5;

function clearAllAttempts() {
  if (passwordAttempts.length === 0) return;
  passwordAttempts.shift();
  clearAllAttempts();
}

function passwordAttemptStamp(fill = false) {
  const recent = Date.now();

  if (passwordAttempts.length === 0) {
    passwordAttempts.push(recent);
    if (!fill)
      return [...passwordAttempts];
  }

  if (fill) {
    clearAllAttempts();
    for(let i = 0; i < MAX_ATTEMPTS; i++) {
      passwordAttempts.push(Date.now());
    }
  }

  const lastAttemps = passwordAttempts[passwordAttempts.length - 1];
  if ((lastAttemps + REMEMBER_LAST_ATTEMP) < recent) {
    passwordAttempts.shift();
  }
  passwordAttempts.push(recent);

  return [...passwordAttempts];
}

module.exports = {
  hashPassword,
  comparePassword,
  mapPasswordData,
  faviconUrl,
  passwordAttemptStamp,
  clearAllAttempts,
}