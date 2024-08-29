/*
  Warnings:

  - A unique constraint covering the columns `[name,groupId]` on the table `Badge` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Badge_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Badge_name_groupId_key" ON "Badge"("name", "groupId");
