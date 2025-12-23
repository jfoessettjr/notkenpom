// lib/upsert.ts
import { prisma } from "./prisma";
import { GameStatus } from "@prisma/client";

export async function getOrCreateSeason(year: number, name?: string) {
  return prisma.season.upsert({
    where: { year },
    update: { name: name ?? undefined },
    create: { year, name },
  });
}

export async function upsertConferenceByName(name: string, shortName?: string) {
  return prisma.conference.upsert({
    where: { name },
    update: { shortName: shortName ?? undefined },
    create: { name, shortName },
  });
}

type UpsertTeamInput = {
  seasonId: number;
  name: string;

  ncaaTeamId?: string | null;
  shortName?: string | null;
  mascot?: string | null;
  abbr?: string | null;

  conferenceName?: string | null; // optional, if your feed provides it
};

export async function upsertTeam(input: UpsertTeamInput) {
  const conferenceId = input.conferenceName
    ? (await upsertConferenceByName(input.conferenceName)).id
    : null;

  // Prefer stable external ID if you have it; fallback to (seasonId,name)
  if (input.ncaaTeamId) {
    return prisma.team.upsert({
      where: { ncaaTeamId: input.ncaaTeamId },
      update: {
        seasonId: input.seasonId,
        conferenceId: conferenceId ?? undefined,
        name: input.name,
        shortName: input.shortName ?? undefined,
        mascot: input.mascot ?? undefined,
        abbr: input.abbr ?? undefined,
      },
      create: {
        seasonId: input.seasonId,
        conferenceId,
        ncaaTeamId: input.ncaaTeamId,
        name: input.name,
        shortName: input.shortName,
        mascot: input.mascot,
        abbr: input.abbr,
      },
    });
  }

  // Fallback unique constraint: @@unique([seasonId, name])
  return prisma.team.upsert({
    where: { seasonId_name: { seasonId: input.seasonId, name: input.name } },
    update: {
      conferenceId: conferenceId ?? undefined,
      shortName: input.shortName ?? undefined,
      mascot: input.mascot ?? undefined,
      abbr: input.abbr ?? undefined,
    },
    create: {
      seasonId: input.seasonId,
      conferenceId,
      name: input.name,
      shortName: input.shortName,
      mascot: input.mascot,
      abbr: input.abbr,
    },
  });
}

type UpsertGameInput = {
  seasonId: number;
  ncaaGameId?: string | null;

  dateTime: Date;
  status?: GameStatus;

  neutralSite?: boolean;

  homeTeamId: number;
  awayTeamId: number;

  homeScore?: number | null;
  awayScore?: number | null;

  venueName?: string | null;
  city?: string | null;
  state?: string | null;
};

export async function upsertGame(input: UpsertGameInput) {
  const data = {
    seasonId: input.seasonId,
    dateTime: input.dateTime,
    status: input.status ?? GameStatus.SCHEDULED,
    neutralSite: input.neutralSite ?? false,
    homeTeamId: input.homeTeamId,
    awayTeamId: input.awayTeamId,
    homeScore: input.homeScore ?? undefined,
    awayScore: input.awayScore ?? undefined,
    venueName: input.venueName ?? undefined,
    city: input.city ?? undefined,
    state: input.state ?? undefined,
  };

  if (input.ncaaGameId) {
    return prisma.game.upsert({
      where: { ncaaGameId: input.ncaaGameId },
      update: data,
      create: { ...data, ncaaGameId: input.ncaaGameId },
    });
  }

  // Fallback: de-dupe by (season, datetime, home, away)
  // Not perfect, but workable if your feed lacks game IDs.
  const existing = await prisma.game.findFirst({
    where: {
      seasonId: input.seasonId,
      dateTime: input.dateTime,
      homeTeamId: input.homeTeamId,
      awayTeamId: input.awayTeamId,
    },
    select: { id: true },
  });

  if (existing) {
    return prisma.game.update({ where: { id: existing.id }, data });
  }

  return prisma.game.create({ data });
}

type UpsertPlayerInput = {
  seasonId: number;
  teamId: number;

  ncaaPlayerId?: string | null;
  firstName: string;
  lastName: string;
  fullName: string;

  position?: string | null;
  jersey?: string | null;
};

export async function upsertPlayer(input: UpsertPlayerInput) {
  if (input.ncaaPlayerId) {
    return prisma.player.upsert({
      where: { ncaaPlayerId: input.ncaaPlayerId },
      update: {
        seasonId: input.seasonId,
        teamId: input.teamId,
        firstName: input.firstName,
        lastName: input.lastName,
        fullName: input.fullName,
        position: input.position ?? undefined,
        jersey: input.jersey ?? undefined,
      },
      create: {
        seasonId: input.seasonId,
        teamId: input.teamId,
        ncaaPlayerId: input.ncaaPlayerId,
        firstName: input.firstName,
        lastName: input.lastName,
        fullName: input.fullName,
        position: input.position ?? undefined,
        jersey: input.jersey ?? undefined,
      },
    });
  }

  // Fallback unique: @@unique([seasonId, teamId, fullName])
  return prisma.player.upsert({
    where: {
      seasonId_teamId_fullName: {
        seasonId: input.seasonId,
        teamId: input.teamId,
        fullName: input.fullName,
      },
    },
    update: {
      firstName: input.firstName,
      lastName: input.lastName,
      position: input.position ?? undefined,
      jersey: input.jersey ?? undefined,
    },
    create: {
      seasonId: input.seasonId,
      teamId: input.teamId,
      firstName: input.firstName,
      lastName: input.lastName,
      fullName: input.fullName,
      position: input.position ?? undefined,
      jersey: input.jersey ?? undefined,
    },
  });
}
