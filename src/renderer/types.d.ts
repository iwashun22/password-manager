
export {}

declare global {
  interface Window {
    db: {
      createEmailAccount: (email: string, password: string) => Promise<any>;
      getAllEmailAccounts: () => Promise<Array<EmailProp>>;
      getAllServiceAccounts: (linkedEmailId?: number) => Promise<Array<ServiceAccountProp> | null>;
      deleteEmailAccount: (emailId: number) => Promise<Object | null>;
      deleteAllData: () => Promise<void>;
    };
    user: {
      getSystemPassword: () => Promise<{ id: number, used_in: string, hashed_password: string }>;
      storePassword: (password: string) => Promise<string>;
      verifyPassword: (password: string) => Promise<boolean>;
      requestDecryptedPassword: <T extends RequestType>(encryptedPassword: string, request: T) => Promise<DecryptReturn<T>>;
    };
  }

  interface EmailProp {
    id: number,
    email: string,
    encrypted_password: string,
    password_length: number
  }

  interface ServiceAccountProp {
    id: number,
    username: string | null,
    email_id: number | null,
    service_id: number,
    encrypted_password: string,
  }
}

type RequestType = "copy" | "get";
type DecryptReturn<T extends RequestType> = T extends "copy" ? boolean : string | undefined;