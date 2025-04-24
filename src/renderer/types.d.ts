
export {}

declare global {
  interface Window {
    db: {
      createEmailAccount: (email: string, encryptedPassword: string) => Promise<any>
      getAllEmailAccounts: () => Promise<any>
    },
    user: {
      getSystemPassword: () => Promise<{ id: number, used_in: string, hashed_password: string }>,
      storePassword: (password: string) => Promise<string>,
    }
  }
}