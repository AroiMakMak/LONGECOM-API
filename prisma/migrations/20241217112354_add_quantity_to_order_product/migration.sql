/*
  Warnings:

  - Added the required column `count` to the `ProductOnOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `ProductOnOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `productonorder` ADD COLUMN `count` INTEGER NOT NULL,
    ADD COLUMN `price` DOUBLE NOT NULL;
