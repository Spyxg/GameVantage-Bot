const Database = require("better-sqlite3");

// Create (or open) the database
const db = new Database("./database/status.db");

// Create the products table
db.exec(`
CREATE TABLE IF NOT EXISTS products (
    product TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    source TEXT NOT NULL,
    last_changed INTEGER NOT NULL
);
`);

console.log("✅ SQLite initialized.");

module.exports = db;