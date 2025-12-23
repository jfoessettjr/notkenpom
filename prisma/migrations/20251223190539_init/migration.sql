/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'FINAL', 'CANCELED', 'POSTPONED');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Season" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conference" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "conferenceId" INTEGER,
    "ncaaTeamId" TEXT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "mascot" TEXT,
    "abbr" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "ncaaPlayerId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "position" TEXT,
    "jersey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "ncaaGameId" TEXT,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'SCHEDULED',
    "neutralSite" BOOLEAN NOT NULL DEFAULT false,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "venueName" TEXT,
    "city" TEXT,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamGameStat" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "opponentTeamId" INTEGER NOT NULL,
    "isHome" BOOLEAN NOT NULL,
    "points" INTEGER,
    "fgm" INTEGER,
    "fga" INTEGER,
    "fg3m" INTEGER,
    "fg3a" INTEGER,
    "ftm" INTEGER,
    "fta" INTEGER,
    "oreb" INTEGER,
    "dreb" INTEGER,
    "reb" INTEGER,
    "ast" INTEGER,
    "stl" INTEGER,
    "blk" INTEGER,
    "tov" INTEGER,
    "pf" INTEGER,
    "possessions" DOUBLE PRECISION,
    "offRtg" DOUBLE PRECISION,
    "defRtg" DOUBLE PRECISION,
    "efg" DOUBLE PRECISION,
    "tovPct" DOUBLE PRECISION,
    "orbPct" DOUBLE PRECISION,
    "ftr" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamGameStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerGameStat" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "minutes" INTEGER,
    "points" INTEGER,
    "fgm" INTEGER,
    "fga" INTEGER,
    "fg3m" INTEGER,
    "fg3a" INTEGER,
    "ftm" INTEGER,
    "fta" INTEGER,
    "oreb" INTEGER,
    "dreb" INTEGER,
    "reb" INTEGER,
    "ast" INTEGER,
    "stl" INTEGER,
    "blk" INTEGER,
    "tov" INTEGER,
    "pf" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerGameStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Season_year_key" ON "Season"("year");

-- CreateIndex
CREATE INDEX "Season_year_idx" ON "Season"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Conference_name_key" ON "Conference"("name");

-- CreateIndex
CREATE INDEX "Team_seasonId_idx" ON "Team"("seasonId");

-- CreateIndex
CREATE INDEX "Team_conferenceId_idx" ON "Team"("conferenceId");

-- CreateIndex
CREATE INDEX "Team_ncaaTeamId_idx" ON "Team"("ncaaTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_seasonId_name_key" ON "Team"("seasonId", "name");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");

-- CreateIndex
CREATE INDEX "Player_seasonId_idx" ON "Player"("seasonId");

-- CreateIndex
CREATE INDEX "Player_ncaaPlayerId_idx" ON "Player"("ncaaPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_seasonId_teamId_fullName_key" ON "Player"("seasonId", "teamId", "fullName");

-- CreateIndex
CREATE UNIQUE INDEX "Game_ncaaGameId_key" ON "Game"("ncaaGameId");

-- CreateIndex
CREATE INDEX "Game_seasonId_dateTime_idx" ON "Game"("seasonId", "dateTime");

-- CreateIndex
CREATE INDEX "Game_homeTeamId_dateTime_idx" ON "Game"("homeTeamId", "dateTime");

-- CreateIndex
CREATE INDEX "Game_awayTeamId_dateTime_idx" ON "Game"("awayTeamId", "dateTime");

-- CreateIndex
CREATE INDEX "TeamGameStat_seasonId_idx" ON "TeamGameStat"("seasonId");

-- CreateIndex
CREATE INDEX "TeamGameStat_teamId_idx" ON "TeamGameStat"("teamId");

-- CreateIndex
CREATE INDEX "TeamGameStat_opponentTeamId_idx" ON "TeamGameStat"("opponentTeamId");

-- CreateIndex
CREATE INDEX "TeamGameStat_gameId_idx" ON "TeamGameStat"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamGameStat_gameId_teamId_key" ON "TeamGameStat"("gameId", "teamId");

-- CreateIndex
CREATE INDEX "PlayerGameStat_seasonId_idx" ON "PlayerGameStat"("seasonId");

-- CreateIndex
CREATE INDEX "PlayerGameStat_gameId_idx" ON "PlayerGameStat"("gameId");

-- CreateIndex
CREATE INDEX "PlayerGameStat_teamId_idx" ON "PlayerGameStat"("teamId");

-- CreateIndex
CREATE INDEX "PlayerGameStat_playerId_idx" ON "PlayerGameStat"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerGameStat_gameId_playerId_key" ON "PlayerGameStat"("gameId", "playerId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamGameStat" ADD CONSTRAINT "TeamGameStat_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamGameStat" ADD CONSTRAINT "TeamGameStat_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamGameStat" ADD CONSTRAINT "TeamGameStat_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGameStat" ADD CONSTRAINT "PlayerGameStat_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGameStat" ADD CONSTRAINT "PlayerGameStat_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGameStat" ADD CONSTRAINT "PlayerGameStat_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerGameStat" ADD CONSTRAINT "PlayerGameStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
