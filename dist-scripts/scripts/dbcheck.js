"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
require("dotenv/config");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
    const seasons = await prisma.season.findMany();
    console.log("seasons:", seasons);
}
main().finally(async () => prisma.$disconnect());
