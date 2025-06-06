CREATE TABLE IF NOT EXISTS keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  used_in TEXT NOT NULL UNIQUE,
  key_string TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  encrypted_password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_name TEXT NOT NULL UNIQUE,
  domain_name TEXT NOT NULL UNIQUE,
  description_text TEXT,
  favicon_png BLOB
);

CREATE TABLE IF NOT EXISTS service_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  email_id INTEGER,
  subaddress TEXT,
  service_id INTEGER NOT NULL,
  oauth_provider TEXT,
  encrypted_password TEXT
);

