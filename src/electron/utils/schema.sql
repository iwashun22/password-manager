CREATE TABLE IF NOT EXISTS passwords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  used_in TEXT NOT NULL UNIQUE,
  hashed_password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  encrypted_password TEXT NOT NULL,
  iv_password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain_name TEXT NOT NULL,
  icon REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS service_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  email_id INTEGER,
  service_id INTEGER NOT NULL,
  encrypted_password TEXT NOT NULL,
  iv_password TEXT NOT NULL,
  CHECK (email_id IS NOT NULL OR username IS NOT NULL)
);

