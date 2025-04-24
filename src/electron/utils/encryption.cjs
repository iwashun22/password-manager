const crypto = require('node:crypto');
const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

function getEncryptionKey(asBuffer = true) {
  const key = process.env.ENCRYPT_KEY;

  if (asBuffer) {
    const buffer = Buffer.from(key, 'base64');
    return buffer;
  }
  return key;
}

function generate24BytesKey() {
  const newKey = crypto.randomBytes(24).toString('base64');
  return newKey;
}

function encrypt(text, key) {
  const IV = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-192-cbc', key, IV);

  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return {
    iv: IV.toString('base64'),
    encrypted,
  }
}

const defaultEncrypt = (text) => encrypt(text, getEncryptionKey());

function decrypt({ iv, encrypted }, key) {
  const decipher = crypto.createDecipheriv(
    'aes-192-cbc',
    key,
    Buffer.from(iv, 'base64')
  );
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const defaultDecrypt = ({ iv, encrypted }) => decrypt({ iv, encrypted }, getEncryptionKey());

module.exports = {
  getEncryptionKey,
  generate24BytesKey,
  defaultEncrypt,
  defaultDecrypt,
}