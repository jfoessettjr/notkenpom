import "dotenv/config";
import { Client } from "pg";

const client = new Client({
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
