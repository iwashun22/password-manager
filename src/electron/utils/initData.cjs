const { app, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const Sqlite = require('better-sqlite3');
const { encrypt, decrypt, generateKeyFromMac } = require('./encryption.cjs');

const encryptedFilePath = path.join(app.getPath('userData'), 'data.enc');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'securedb-'));
const tempFilePath = path.join(tempDir, 'data.db');

let tmpDb;
try {
  tmpDb = decryptDB();
  initializeSchema(tmpDb);
}
catch (err) {
  tmpDb = null;
}

function initializeSchema(db) {
  const schema = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
}

function decryptDB() {
  if (!fs.existsSync(encryptedFilePath))
    return new Sqlite(tempFilePath);

  const data = fs.readFileSync(encryptedFilePath);
  if (!data) return new Sqlite(tempFilePath);

  try {
    const decrypted = decrypt(data, generateKeyFromMac(), true);

    fs.writeFileSync(tempFilePath, decrypted);
    return new Sqlite(tempFilePath);
  }
  catch (err) {
    console.error('Failed to decrypt data:', err);
    console.log('This may be caused by an application error or because the encrypted data was modified.');
    // throw new Error('CorruptedData');
    return null;
  }
}

function encryptDB() {
  const raw = fs.readFileSync(tempFilePath);
  const encrypted = encrypt(raw, generateKeyFromMac(), true);

  fs.writeFileSync(encryptedFilePath, encrypted);
}

function cleanupTemp() {
  try {
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

    // Remove the tempDir only if it's empty
    if (fs.existsSync(tempDir) && fs.readdirSync(tempDir).length === 0) {
      fs.rmdirSync(tempDir);
    }
  } catch (err) {
    console.error('Cleanup failed:', err);
  }
}

module.exports = {
  db: tmpDb,
  encryptDB,
  cleanupTemp,
  initializeSchema,
  tempFilePath,
}