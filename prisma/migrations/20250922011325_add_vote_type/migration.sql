/*
  Warnings:

  - Added the required column `type` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Vote" ADD COLUMN     "type" TEXT NOT NULL;
