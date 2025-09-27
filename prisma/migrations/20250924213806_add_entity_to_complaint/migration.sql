-- AlterTable
ALTER TABLE "public"."Complaint" ADD COLUMN     "entityId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Complaint" ADD CONSTRAINT "Complaint_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entidad"("id") ON DELETE SET NULL ON UPDATE CASCADE;
