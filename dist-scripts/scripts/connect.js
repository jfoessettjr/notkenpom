"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const client = new pg_1.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
async function main() {
    await client.connect();
    const res = await client.query("select now()");
    console.log(res.rows);
    await client.end();
}
main().catch(console.error);
