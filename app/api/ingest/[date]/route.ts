export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { upsertTeam, upsertGame, getOrCreateSeason } from "@/lib/upsert";

const BASE = process.env.NCAA_API_BASE || "https://ncaa-api.henrygd.me";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function parseDateParam(dateParam: string) {
  // Expect YYYY-MM-DD
  const [y, m, d] = dateParam.split("-").map(Number);
  if (!y || !m || !d) throw new Error("Invalid date format. Use YYYY-MM-DD.");
  return { y, m, d };
}

function mapStatus(gameState?: string) {
  switch ((gameState || "").toLowerCase()) {
    case "final":
      return "FINAL";
    case "live":
    case "in_progress":
    case "in-progress":
      return "IN_PROGRESS";
    case "canceled":
      return "CANCELED";
    case "postponed":
      return "POSTPONED";
    default:
      return "SCHEDULED";
  }
}

function extractNcaagameId(gameUrl?: string) {
  // gameUrl like "/game/6154104"
  const m = (gameUrl || "").match(/\/game\/(\d+)/);
  return m?.[1] ?? null;
}

export async function POST(
  _req: Request,
  { params }: { params: { date: string } }
) {
  try {
    const { y, m, d } = parseDateParam(params.date);

    // NCAA scoreboard path pattern (men’s D1)
    // Example format shown in ncaa-api docs/issues: /scoreboard/basketball-men/d1/YYYY/MM/DD/all-conf :contentReference[oaicite:2]{index=2}
    const path = `/scoreboard/basketball-men/d1/${y}/${pad2(m)}/${pad2(d)}/all-conf`;
    const url = `${BASE}${path}`;

    const res = await fetch(url, {
      headers: { "user-agent": "notkenpom/1.0" },
      cache: "no-store",
    });

    if (!res.ok) {
      // Upcoming dates sometimes 404; don’t crash your whole pipeline. :contentReference[oaicite:3]{index=3}
      return NextResponse.json(
        { ok: false, status: res.status, message: `Fetch failed: ${url}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Choose your season convention. This keeps it simple:
    // if month >= 11 => seasonYear = y+1 else y
    const seasonYear = m >= 11 ? y + 1 : y;
    const seasonName = `${seasonYear - 1}-${String(seasonYear).slice(-2)}`;
    const season = await getOrCreateSeason(seasonYear, seasonName);

    const games = Array.isArray(data?.games) ? data.games : [];
    let createdOrUpdatedGames = 0;
    let createdOrUpdatedTeams = 0;

    for (const item of games) {
      const g = item?.game;
      if (!g?.home?.names?.full || !g?.away?.names?.full) continue;

      const homeNames = g.home.names;
      const awayNames = g.away.names;

      const homeConf = g.home.conferences?.[0]?.conferenceName ?? null;
      const awayConf = g.away.conferences?.[0]?.conferenceName ?? null;

      const home = await upsertTeam({
        seasonId: season.id,
        name: homeNames.full,
        shortName: homeNames.short ?? null,
        abbr: homeNames.char6 ?? null,
        ncaaTeamId: homeNames.seo ?? null, // stable-ish ID from NCAA
        conferenceName: homeConf,
      });

      const away = await upsertTeam({
        seasonId: season.id,
        name: awayNames.full,
        shortName: awayNames.short ?? null,
        abbr: awayNames.char6 ?? null,
        ncaaTeamId: awayNames.seo ?? null,
        conferenceName: awayConf,
      });

      createdOrUpdatedTeams += 2;

      const startEpoch = g.startTimeEpoch ? Number(g.startTimeEpoch) * 1000 : null;
      const dateTime = startEpoch ? new Date(startEpoch) : new Date(`${y}-${pad2(m)}-${pad2(d)}T12:00:00Z`);

      const ncaaGameId = extractNcaagameId(g.url);

      await upsertGame({
        seasonId: season.id,
        ncaaGameId: ncaaGameId ?? undefined,
        dateTime,
        status: mapStatus(g.gameState),
        neutralSite: false, // NCAA scoreboard doesn’t always say; we can improve later
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeScore: g.home.score ? Number(g.home.score) : null,
        awayScore: g.away.score ? Number(g.away.score) : null,
      });

      createdOrUpdatedGames += 1;
    }

    return NextResponse.json({
      ok: true,
      date: params.date,
      fetched: games.length,
      gamesUpserted: createdOrUpdatedGames,
      teamsTouched: createdOrUpdatedTeams,
      season: { id: season.id, year: season.year, name: season.name },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
