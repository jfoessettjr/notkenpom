"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/smoke.ts
const prisma_1 = require("../lib/prisma");
const upsert_1 = require("../lib/upsert");
const client_1 = require("@prisma/client");
require("dotenv/config");
async function main() {
    const season = await (0, upsert_1.getOrCreateSeason)(2026, "2025-26");
    const duke = await (0, upsert_1.upsertTeam)({
        seasonId: season.id,
        name: "Duke",
        abbr: "DUKE",
        conferenceName: "ACC",
    });
    const unc = await (0, upsert_1.upsertTeam)({
        seasonId: season.id,
        name: "North Carolina",
        abbr: "UNC",
        conferenceName: "ACC",
    });
    const game = await (0, upsert_1.upsertGame)({
        seasonId: season.id,
        dateTime: new Date(),
        status: client_1.GameStatus.SCHEDULED,
        neutralSite: false,
        homeTeamId: duke.id,
        awayTeamId: unc.id,
    });
    console.log({ season, duke, unc, game });
}
main()
    .catch(console.error)
    .finally(async () => prisma_1.prisma.$disconnect());
