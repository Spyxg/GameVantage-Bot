const Database = require("better-sqlite3");

const db = new Database("./database/status.db");

db.exec(`
CREATE TABLE IF NOT EXISTS products (
    product TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    source TEXT NOT NULL,
    last_changed INTEGER NOT NULL
);
`);

console.log("✅ SQLite initialized.");

function getProduct(product) {

    return db.prepare(`
        SELECT *
        FROM products
        WHERE product = ?
    `).get(product);

}

function hasStatusChanged(product, newStatus) {

    const existing = getProduct(product);

    if (!existing) {
        return true;
    }

    return existing.status !== newStatus;

}

function getAllProducts() {

    return db.prepare(`
        SELECT *
        FROM products
    `).all();

}

function setProduct(product, status, source) {

    db.prepare(`
        INSERT INTO products
        (product, status, source, last_changed)

        VALUES (?, ?, ?, ?)

        ON CONFLICT(product)

        DO UPDATE SET

            status = excluded.status,
            source = excluded.source,
            last_changed = excluded.last_changed
    `).run(
        product,
        status,
        source,
        Date.now()
    );

}

module.exports = {

    getProduct,
    getAllProducts,
    setProduct,
    hasStatusChanged

};