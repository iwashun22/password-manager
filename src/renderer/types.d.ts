
export {}

declare global {
  interface Window {
    db: {
      createEmailAccount: (email: string, password: string) => Promise<any>;
      createServiceAccount: (serviceId: number, emailId: number | null, subaddress: string | null, username: string, password: string, oAuthProvider: string | null) => Promise<Info | null>;
      createService: <T extends string>(serviceName: T, domain: T, description: T) => Promise<Info | null>;
      getAllEmailAccounts: () => Promise<Array<EmailProp>>;
      getEmailAccount: (email: string | number) => Promise<EmailProp | undefined>;
      getAllServices: () => Promise<Array<ServiceProp> | null>
      getServiceAccountsLinkedToEmail: (linkedEmailId?: number) => Promise<Array<ServiceAccountProp> | null>;
      getServiceAccount: (serviceId: number, username: string, emailId: number | null, subaddress: string | null, oauthProvider: string) => Promise<ServiceAccountProp | undefined | null>;
      getServiceAccountsById: (serviceId: number) => Promise<Array<ServiceAccountProp> | null>;
      getOAuthProviders: () => Promise<Array<string>>;
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

  interface Info {
    changes: number,
    lastInsertRowid: number
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
    subaddress: string,
    service_id: number,
    oauth_provider: string,
    encrypted_password: string,
  }

  interface ServiceProp {
    id: number,
    service_name: string,
    domain_name: string,
    description_text: string,
    favicon_png: Buffer | null,
    count: number,
  }
}

type RequestType = "copy" | "get";
type DecryptReturn<T extends RequestType> = T extends "copy" ? boolean : string | undefined;