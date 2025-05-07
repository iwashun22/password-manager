const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const { generateKey } = require('./src/electron/utils/encryption.cjs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const arg_path = process.argv[2] || 'src/electron/.env';
const KEY_NAME = process.argv[3] || 'ENCRYPT_KEY';

const KEY_PATH = path.join(__dirname, arg_path);

require('dotenv').config({ path: KEY_PATH });

const key = process.env[KEY_NAME];
console.log(key);

function generateNewKey() {
  const newKey = generateKey();
  const format = `${KEY_NAME}="${newKey}"\n`;
  fs.writeFileSync(KEY_PATH, format, { encoding: 'utf-8' });
  return newKey;
}

if (key) {
  rl.question('The key is already exist, are you sure you want to replace a new key?: ', (answer) => {
    const confirmRegex = /^(y$|yes)/i;
    if (confirmRegex.test(answer)) {
      const newKey = generateNewKey();
      console.log(`New key generated: ${newKey}`);
    } else {
      console.log('Canceled key generation.');
    }
    rl.close();
    process.exit();
  })
}
else {
  const newKey = generateNewKey();
  console.log(`New key generated: ${newKey}`);
  process.exit();
}
