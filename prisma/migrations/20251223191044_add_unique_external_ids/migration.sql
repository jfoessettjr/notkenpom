/*
  Warnings:

  - A unique constraint covering the columns `[ncaaPlayerId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ncaaTeamId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Player_ncaaPlayerId_key" ON "Player"("ncaaPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_ncaaTeamId_key" ON "Team"("ncaaTeamId");
