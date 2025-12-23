// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Convention:
 * - If we're in Nov/Dec, it's the start of the season labeled next year (e.g., Dec 2025 -> 2026).
 * - Else use current year.
 * Adjust if you prefer "2025-26" stored differently.
 */
function inferSeasonYear(now = new Date()) {
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  return month >= 11 ? year + 1 : year;
}

async function main() {
  const seasonYear = inferSeasonYear();
  const seasonName = `${seasonYear - 1}-${String(seasonYear).slice(-2)}`;

  const season = await prisma.season.upsert({
    where: { year: seasonYear },
    update: { name: seasonName },
    create: { year: seasonYear, name: seasonName },
  });

  const conferences = [
    { name: "ACC", shortName: "ACC" },
    { name: "Big Ten", shortName: "B1G" },
    { name: "Big 12", shortName: "B12" },
    { name: "SEC", shortName: "SEC" },
    { name: "Big East", shortName: "BE" },
    { name: "Pac-12", shortName: "P12" },
    { name: "AAC", shortName: "AAC" },
    { name: "A-10", shortName: "A10" },
    { name: "WCC", shortName: "WCC" },
    { name: "Mountain West", shortName: "MW" },
    { name: "C-USA", shortName: "CUSA" },
    { name: "MAC", shortName: "MAC" },
    { name: "Sun Belt", shortName: "SBC" },
    { name: "MVC", shortName: "MVC" },
    { name: "Ivy League", shortName: "Ivy" },
    { name: "Horizon", shortName: "HL" },
    { name: "MAAC", shortName: "MAAC" },
    { name: "SoCon", shortName: "SoCon" },
    { name: "Big Sky", shortName: "BigSky" },
    { name: "Big South", shortName: "BigSouth" },
    { name: "Patriot League", shortName: "Patriot" },
    { name: "CAA", shortName: "CAA" },
  ];

  // Upsert conferences
  for (const c of conferences) {
    await prisma.conference.upsert({
      where: { name: c.name },
      update: { shortName: c.shortName },
      create: c,
    });
  }

  console.log(`Seed complete.`);
  console.log(`Season: ${season.year} (${season.name})`);
  console.log(`Conferences: ${conferences.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  // prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Convention:
 * - If we're in Nov/Dec, it's the start of the season labeled next year (e.g., Dec 2025 -> 2026).
 * - Else use current year.
 * Adjust if you prefer "2025-26" stored differently.
 */
function inferSeasonYear(now = new Date()) {
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  return month >= 11 ? year + 1 : year;
}

async function main() {
  const seasonYear = inferSeasonYear();
  const seasonName = `${seasonYear - 1}-${String(seasonYear).slice(-2)}`;

  const season = await prisma.season.upsert({
    where: { year: seasonYear },
    update: { name: seasonName },
    create: { year: seasonYear, name: seasonName },
  });

  const conferences = [
    { name: "ACC", shortName: "ACC" },
    { name: "Big Ten", shortName: "B1G" },
    { name: "Big 12", shortName: "B12" },
    { name: "SEC", shortName: "SEC" },
    { name: "Big East", shortName: "BE" },
    { name: "Pac-12", shortName: "P12" },
    { name: "AAC", shortName: "AAC" },
    { name: "A-10", shortName: "A10" },
    { name: "WCC", shortName: "WCC" },
    { name: "Mountain West", shortName: "MW" },
    { name: "C-USA", shortName: "CUSA" },
    { name: "MAC", shortName: "MAC" },
    { name: "Sun Belt", shortName: "SBC" },
    { name: "MVC", shortName: "MVC" },
    { name: "Ivy League", shortName: "Ivy" },
    { name: "Horizon", shortName: "HL" },
    { name: "MAAC", shortName: "MAAC" },
    { name: "SoCon", shortName: "SoCon" },
    { name: "Big Sky", shortName: "BigSky" },
    { name: "Big South", shortName: "BigSouth" },
    { name: "Patriot League", shortName: "Patriot" },
    { name: "CAA", shortName: "CAA" },
  ];

  // Upsert conferences
  for (const c of conferences) {
    await prisma.conference.upsert({
      where: { name: c.name },
      update: { shortName: c.shortName },
      create: c,
    });
  }

  console.log(`Seed complete.`);
  console.log(`Season: ${season.year} (${season.name})`);
  console.log(`Conferences: ${conferences.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
