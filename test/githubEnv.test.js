describe('Load github environment variables', () => {
  test('Get TEST_CODE', () => {
    expect(process.env.TEST_CODE).toBe('hello1234');
  })
});