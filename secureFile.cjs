const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const firstArg = process.argv[2];
const watchFile = process.argv[3];

const TAG_LENGTH = 16;

if (!firstArg || !watchFile) {
  throw new Error('Argument is not provided.');
}
else if (!(firstArg === "-e" || firstArg === "-d")) {
  throw new Error('First argument is invalid. -e for encryption and -d for decryption.');
}

const actionFile = path.resolve(__dirname, watchFile);

if (!fs.existsSync(actionFile)) {
  throw new Error('The file does not exist.');
}

switch(firstArg) {
  case '-e':
    encrypt(actionFile);
    break;
  case '-d':
    decrypt(actionFile);
    break;
}

process.exit();

function encrypt(file) {
  const parentDir = path.dirname(file);
  const filename = path.parse(file).base;

  const buffer = fs.readFileSync(file);
  const nonce = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv('aes-256-ccm', key, nonce, { authTagLength: TAG_LENGTH });

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  const combined = Buffer.concat([nonce, encrypted, tag]);

  const outFileName = filename + '.enc';
  const outputFile = path.join(parentDir, outFileName);
  fs.writeFileSync(outputFile, combined);
}

function decrypt(file) {
  const parentDir = path.dirname(file);
  const { name: fileName, ext } = path.parse(file);

  const encRegex = /.enc$/;
  if (!encRegex.test(ext)) {
    throw new Error('The file extension is not supported.');
  }

  const buffer = fs.readFileSync(file);
  const nonce = buffer.subarray(0, 12);
  const encrypted = buffer.subarray(12, buffer.length - TAG_LENGTH);
  const tag = buffer.subarray(buffer.length - TAG_LENGTH);
  console.log(tag);
  const key = getKey();
  const decipher = crypto.createDecipheriv('aes-256-ccm', key, nonce, {
    authTagLength: TAG_LENGTH
  });
  decipher.setAuthTag(tag);
  
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  
  const outFileName = fileName + ext.replace('.enc', '');
  const outputFile = path.resolve(parentDir, outFileName);
  fs.writeFileSync(outputFile, decrypted);
}

function getKey() {
  const base64 = process.env.ENCRYPTION_KEY;
  return Buffer.from(base64, 'base64');
}
