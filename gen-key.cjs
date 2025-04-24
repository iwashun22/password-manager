const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const { generate24BytesKey } = require('./src/electron/utils/encryption.cjs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const KEY_PATH = path.join(__dirname, 'src/electron/.env');
require('dotenv').config({ path: KEY_PATH });

const key = process.env.ENCRYPT_KEY;

function generateNewKey() {
  const newKey = generate24BytesKey();
  const format = `ENCRYPT_KEY="${newKey}"\n`;
  fs.writeFileSync(KEY_PATH, format, { encoding: 'utf-8' });
  return newKey;
}

if (key) {
  rl.question('The key is already exist, are you sure you want to replace a new key?: ', (answer) => {
    const confirmRegex = /^(y$|yes)/i;
    if (confirmRegex.test(answer)) {
      const newKey = generateNewKey();
      console.log(`New key generated: ${newKey}`);
    }
    rl.close();
    process.exit();
  })
}
else {
  const newKey = generateNewKey();
  console.log(`New key generated: ${newKey}`);
}
