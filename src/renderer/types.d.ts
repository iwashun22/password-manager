
export {}

declare global {
  interface Window {
    db: {
      createEmailAccount: (email: string, password: string) => Promise<any>;
      getAllEmailAccounts: () => Promise<Array<EmailProp>>;
      getAllServices: () => Promise<Array<ServiceProp> | null>
      getAllServiceAccounts: (linkedEmailId?: number) => Promise<Array<ServiceAccountProp> | null>;
      editEmailAccount: (emailId: number, newPassword: string) => Promise<Object | null>;
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

  interface ServiceProp {
    id: number,
    service_name: string,
    domain_name: string,
    description_text: Text,
    icon: Buffer,
    count: number,
  }
}

type RequestType = "copy" | "get";
type DecryptReturn<T extends RequestType> = T extends "copy" ? boolean : string | undefined;