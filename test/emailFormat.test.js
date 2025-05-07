const { matchEmailPattern } = require('../src/renderer/utils/helper');

describe('Check valid email format', () => {
  test('Returns undefined for an invalid domain format', () => {
    expect(matchEmailPattern('someuser@helloworld')).toBe(undefined);
    expect(matchEmailPattern('testing@no@com')).toBe(undefined);
    expect(matchEmailPattern('fakemail@.name.s')).toBe(undefined);
    expect(matchEmailPattern('invalid@asd..com')).toBe(undefined);
    expect(matchEmailPattern('lastdot@gmail.com.')).toBe(undefined);
  })

  test('Returns undefined for an invalid username', () => {
    expect(matchEmailPattern(';lkj4$@gmail.com')).toBe(undefined);
    expect(matchEmailPattern('csdw%%_12@hotmail.com')).toBe(undefined);
    expect(matchEmailPattern('iwajsd@jk@gmail.com')).toBe(undefined);
  })

  test('Separates email and subaddress correctly', () => {
    const firstEmail = matchEmailPattern('test_user@gmail.com');
    const secondEmail = matchEmailPattern('newaccount123+shopping@icloud.com');

    expect(firstEmail).not.toBe(undefined);
    expect(firstEmail.email).toBe('test_user@gmail.com');
    expect(firstEmail.subaddress).toBe(null);

    expect(secondEmail).not.toBe(undefined);
    expect(secondEmail.email).toBe('newaccount123@icloud.com');
    expect(secondEmail.subaddress).toBe('shopping');
  })
})