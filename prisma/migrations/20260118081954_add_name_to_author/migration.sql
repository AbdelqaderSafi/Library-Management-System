/*
  Warnings:

  - You are about to drop the column `email` on the `authors` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `authors` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "authors_email_key";

-- AlterTable
ALTER TABLE "authors" DROP COLUMN "email";

-- CreateIndex
CREATE UNIQUE INDEX "authors_name_key" ON "authors"("name");
