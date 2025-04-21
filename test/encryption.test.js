const {
  getEncryptionKey,
  defaultEncrypt,
  defaultDecrypt
} = require('../src/electron/utils/encryption.cjs');

describe('Valid encryption key', () => {
  test('The key has 24 bytes size', () => {
    const keyBuffer = getEncryptionKey();
    const keyBase64 = getEncryptionKey(false);

    expect(keyBuffer.length).toBe(24);
    expect(keyBase64.length).toBe(32); // (24 * 8) / 6
  })
})

const plaintext = "hello world!";
describe('Encrypt and Decrypt text', () => {  
  const encryptedData = defaultEncrypt(plaintext);

  test(`Encrypt text "${plaintext}"`, () => {

    expect(Object.keys(encryptedData).length).toBe(2);
    expect(typeof encryptedData.iv).toBe('string');
    expect(typeof encryptedData.encrypted).toBe('string');
  })

  test(`Decrypt encrypted data "${encryptedData.encrypted}"`, () => {
    const decrypted = defaultDecrypt(encryptedData);
  
    expect(encryptedData).not.toBe(plaintext);
    expect(encryptedData).not.toBe(decrypted);
    expect(decrypted).toBe(plaintext);
  })
})
