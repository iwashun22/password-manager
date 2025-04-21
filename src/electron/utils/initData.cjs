const { app } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const Sqlite = require('better-sqlite3');

const dbDir = path.join(app.getPath('userData'), 'db');
const dbFile = 'data.db';

const db = new Sqlite(path.join(dbDir, dbFile));

function initializeSchema(schemaPath) {
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
}
initializeSchema(path.resolve(__dirname, 'schema.sql'));

module.exports = {
  dbDir,
  dbFile,
  db,
}