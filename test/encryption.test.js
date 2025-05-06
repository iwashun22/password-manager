const {
  defaultEncrypt,
  defaultDecrypt
} = require('../src/electron/utils/encryption.cjs');

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
})
