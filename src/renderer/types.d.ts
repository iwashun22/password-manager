
export {}

declare global {
  interface Window {
    db: {
      createEmailAccount: (email: string, password: string) => Promise<Info | null>;
      createServiceAccount: (serviceId: number, emailId: number | null, subaddress: string | null, username: string, password: string, oAuthProvider: string | null) => Promise<Info | null>;
      createService: <T extends string>(serviceName: T, domain: T, description: T) => Promise<Info | null>;
      getAllEmailAccounts: () => Promise<Array<EmailProp>>;
      getEmailAccount: (email: string | number) => Promise<EmailProp | undefined>;
      getAllServices: <T extends number | undefined>(id?: T) =>
        T extends number ? Promise<ServiceProp | null> : Promise<Array<ServiceProp> | null>;
      getServiceAccountsLinkedToEmail: (linkedEmailId?: number) => Promise<Array<ServiceAccountProp> | null>;
      getServiceAccount: (serviceId: number, username: string, emailId: number | null, subaddress: string | null, oauthProvider: string) => Promise<ServiceAccountProp | undefined | null>;
      getServiceAccountsById: (id: number, id_type: 'service' | 'account') => Promise<Array<ServiceAccountProp> | null>;
      getOAuthProviders: () => Promise<Array<string>>;
      editEmailAccount: (emailId: number, newPassword: string) => Promise<Info | null>;
      editService: (serviceId: number, serviceName: string, domainName: string, description: string) => Promise<Info | null>;
      editServiceAccount: (accountId: number, serviceId: number, username: string, emailId: number | null, subaddress: string | null, password: string) => Promise<Info | ServiceAccountProp | null>;
      deleteEmailAccount: (emailId: number) => Promise<Info | null>;
      deleteServiceAccount: (serviceId: number) => Promise<Info | null>;
      deleteAllData: () => Promise<void>;
    };
    user: {
      getSystemPassword: () => Promise<{ id: number, used_in: string, hashed_password: string }>;
      storePassword: (password: string) => Promise<string | null>;
      verifyPassword: (password: string) => Promise<boolean | number>;
      verifyRecoveryKey: (recoveryKey: string) => Promise<boolean>;
      updatePassword: (password: string) => Promise<Info | null>;
      requestDecryptedPassword: <T extends RequestType>(encryptedPassword: string, request: T) => Promise<DecryptReturn<T>>;
      formattingEmail: (emailId: number, subaddress: string) => Promise<string | null>;
      retryFetchFavicon: (serviceId: number, domain: string) => Promise<Buffer | null>;
      saveDatabase: () => Promise<void>;
      openExternalLink: (url: string) => Promise<boolean>;
    };
    backup: {
      getBackupData: (recoveryKey: string) => Promise<string | null>;
      loadBackupData: (data: string, recoveryKey: string) => Promise<Array<object> | null>;
      loadEachService: (json: object) => Promise<boolean>;
      checkKeySize: (keyString: string) => Promise<boolean | null>;
    }
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
    password_length: number,
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
type DecryptReturn<T extends RequestType> = T extends "copy" ? boolean : string;