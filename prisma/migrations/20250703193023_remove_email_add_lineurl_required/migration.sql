/*
  Warnings:

  - You are about to drop the column `email` on the `Entry` table. All the data in the column will be lost.
  - Made the column `lineUrl` on table `Entry` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "email",
ALTER COLUMN "lineUrl" SET NOT NULL;
