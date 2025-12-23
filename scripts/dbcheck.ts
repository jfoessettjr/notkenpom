import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";


const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const seasons = await prisma.season.findMany();
  console.log("seasons:", seasons);
}

main().finally(async () => prisma.$disconnect());
