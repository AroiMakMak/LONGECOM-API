/*
  Warnings:

  - You are about to drop the column `currentcy` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `stripepaymentId` on the `order` table. All the data in the column will be lost.
  - Added the required column `currency` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripePaymentId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `currentcy`,
    DROP COLUMN `stripepaymentId`,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL,
    ADD COLUMN `stripePaymentId` VARCHAR(191) NOT NULL;
