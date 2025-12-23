"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateSeason = getOrCreateSeason;
exports.upsertConferenceByName = upsertConferenceByName;
exports.upsertTeam = upsertTeam;
exports.upsertGame = upsertGame;
exports.upsertPlayer = upsertPlayer;
// lib/upsert.ts
const prisma_1 = require("./prisma");
const client_1 = require("@prisma/client");
async function getOrCreateSeason(year, name) {
    return prisma_1.prisma.season.upsert({
        where: { year },
        update: { name: name ?? undefined },
        create: { year, name },
    });
}
async function upsertConferenceByName(name, shortName) {
    return prisma_1.prisma.conference.upsert({
        where: { name },
        update: { shortName: shortName ?? undefined },
        create: { name, shortName },
    });
}
async function upsertTeam(input) {
    const conferenceId = input.conferenceName
        ? (await upsertConferenceByName(input.conferenceName)).id
        : null;
    // Prefer stable external ID if you have it; fallback to (seasonId,name)
    if (input.ncaaTeamId) {
        return prisma_1.prisma.team.upsert({
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
    return prisma_1.prisma.team.upsert({
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
async function upsertGame(input) {
    const data = {
        seasonId: input.seasonId,
        dateTime: input.dateTime,
        status: input.status ?? client_1.GameStatus.SCHEDULED,
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
        return prisma_1.prisma.game.upsert({
            where: { ncaaGameId: input.ncaaGameId },
            update: data,
            create: { ...data, ncaaGameId: input.ncaaGameId },
        });
    }
    // Fallback: de-dupe by (season, datetime, home, away)
    // Not perfect, but workable if your feed lacks game IDs.
    const existing = await prisma_1.prisma.game.findFirst({
        where: {
            seasonId: input.seasonId,
            dateTime: input.dateTime,
            homeTeamId: input.homeTeamId,
            awayTeamId: input.awayTeamId,
        },
        select: { id: true },
    });
    if (existing) {
        return prisma_1.prisma.game.update({ where: { id: existing.id }, data });
    }
    return prisma_1.prisma.game.create({ data });
}
async function upsertPlayer(input) {
    if (input.ncaaPlayerId) {
        return prisma_1.prisma.player.upsert({
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
    return prisma_1.prisma.player.upsert({
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
