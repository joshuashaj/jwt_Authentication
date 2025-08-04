/*
  Warnings:

  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `station` ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE `Station` ADD CONSTRAINT `Station_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
