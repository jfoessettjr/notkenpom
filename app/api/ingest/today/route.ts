export const runtime = "nodejs";

import "dotenv/config";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { upsertTeam, upsertGame, getOrCreateSeason } from "@/lib/upsert";

/**
 * For now, this endpoint just demonstrates the ingest pipeline:
 * - Ensures a season exists
 * - Upserts two teams
 * - Upserts one game for "today"
 *
 * Next step will replace the hardcoded data with NCAA schedule fetch + parsing.
 */
export async function POST() {
  try {
    // Choose your season convention (example: 2026 for 2025-26)
    const season = await getOrCreateSeason(2026, "2025-26");

    const home = await upsertTeam({
      seasonId: season.id,
      name: "Duke",
      abbr: "DUKE",
      conferenceName: "ACC",
      ncaaTeamId: "duke-demo",
    });

    const away = await upsertTeam({
      seasonId: season.id,
      name: "North Carolina",
      abbr: "UNC",
      conferenceName: "ACC",
      ncaaTeamId: "unc-demo",
    });

    const game = await upsertGame({
      seasonId: season.id,
      ncaaGameId: "demo-game-1",
      dateTime: new Date(),
      status: "SCHEDULED",
      neutralSite: false,
      homeTeamId: home.id,
      awayTeamId: away.id,
      venueName: "Demo Arena",
      city: "Durham",
      state: "NC",
    });

    return NextResponse.json({
      ok: true,
      season: { id: season.id, year: season.year, name: season.name },
      homeTeam: { id: home.id, name: home.name },
      awayTeam: { id: away.id, name: away.name },
      game: { id: game.id, dateTime: game.dateTime, status: game.status },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  } finally {
    // In serverless, Prisma handles pooling; no need to disconnect each call.
    // await prisma.$disconnect();
  }
}
