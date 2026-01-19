/*
  Warnings:

  - You are about to drop the column `bio` on the `authors` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `authors` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `authors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "authors" DROP COLUMN "bio",
ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "authors_email_key" ON "authors"("email");
