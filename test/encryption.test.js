const {
  defaultEncrypt,
  defaultDecrypt,
  aesCipher,
  generateToken,
  getRandomTokenKey,
  makeBackupFile,
  getBackupTokens,
  encrypt,
  decrypt
} = require('../src/electron/utils/encryption.cjs');
const crypto = require('crypto');

const plaintext = "hello world!";
describe('Encrypt and Decrypt text', () => {  
  const encryptedData = defaultEncrypt(plaintext);

  test(`Encrypt text "${plaintext}"`, () => {
    expect(encryptedData).not.toBe(plaintext);
    expect(typeof encryptedData).toBe('string');
  })

  test(`Decrypt encrypted data "${encryptedData.encrypted}"`, () => {
    const decrypted = defaultDecrypt(encryptedData);
  
    expect(encryptedData).not.toBe(decrypted);
    expect(decrypted).toBe(plaintext);
  })
});

describe('AES cipher', () => {
  test('Encrypt and Decrypt data', () => {
    const key = crypto.randomBytes(16);
    const data = crypto.randomBytes(20);

    const encrypted = aesCipher(data, key, 'encrypt');
    const decrypted = aesCipher(encrypted, key, 'decrypt');

    expect(Buffer.compare(encrypted, data)).not.toBe(0);
    expect(Buffer.compare(decrypted, data)).toBe(0);
  })
});

describe('Generate token & get random key', () => {
  test('Function generateToken() getRandomTokenKey()', () => {
    const { token, recoveryToken, recoveryKey } = generateToken();

    expect(recoveryKey.length).toBe((48 / 3) * 4);
    const randomKey = getRandomTokenKey({
      token,
      recoveryToken,
      recoveryKey
    });
    expect(randomKey.length).toBe(32);
  })

  test('getRandomTokenKey(): with generated backup data', () => {
    const randomKey = getRandomTokenKey({
      token: "U+jMdepdEMD14N1vMhPPx0cDWObQ6aL0sn6GFI31jKbGF9azwWwQ7I55gDqhlmZ90wPSmV0ygqGKg+jK",
      recoveryToken: "6CFZldzbrduEuyh4oz2kjRAgpb0LTULnwFxQbXXxxBxH8YpVOFw5tWumqe4=",
      recoveryKey: "xSBNQDBqSXyy4YQ2IvzTpNBieFsqEX3VLwXRMvm7Hxv7IvMUTy0uia87EXrJc6H3"
    })

    expect(randomKey).not.toBe(null);
  })
});

describe('Making & Reading Backup file', () => {
  test('Can retrieve tokens from backup file', () => {
    // generate tokens
    const { token, recoveryKey, recoveryToken } = generateToken();
    // get random keys
    const randomKey = getRandomTokenKey({ token, recoveryKey, recoveryToken });

    // make file format
    const foo = "hello world";
    const encrypted = encrypt(foo, randomKey);
    const file = makeBackupFile({ token, recoveryToken, recoveryKey }, encrypted);

      expect(typeof file).toBe("string");

    // get tokens from the file format
    const { encrypted: fileData, recoveryToken: _r_token, token: _token } = getBackupTokens(file);

      expect(token).toBe(_token);
      expect(recoveryToken).toBe(_r_token);
      expect(encrypted).toBe(fileData);

    // get random key from the file data
    const _random_key = getRandomTokenKey({
      token: _token,
      recoveryToken: _r_token,
      recoveryKey: recoveryKey
    });

      expect(Buffer.compare(randomKey, _random_key)).toBe(0);

    const bar = decrypt(fileData, _random_key);

      expect(foo).toBe(bar);
  })
});
