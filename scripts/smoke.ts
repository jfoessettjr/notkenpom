// scripts/smoke.ts
import { prisma } from "../lib/prisma";
import { getOrCreateSeason, upsertTeam, upsertGame } from "../lib/upsert";
import { GameStatus } from "@prisma/client";
import "dotenv/config";


async function main() {
  const season = await getOrCreateSeason(2026, "2025-26");

  const duke = await upsertTeam({
    seasonId: season.id,
    name: "Duke",
    abbr: "DUKE",
    conferenceName: "ACC",
  });

  const unc = await upsertTeam({
    seasonId: season.id,
    name: "North Carolina",
    abbr: "UNC",
    conferenceName: "ACC",
  });

  const game = await upsertGame({
    seasonId: season.id,
    dateTime: new Date(),
    status: GameStatus.SCHEDULED,
    neutralSite: false,
    homeTeamId: duke.id,
    awayTeamId: unc.id,
  });

  console.log({ season, duke, unc, game });
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
