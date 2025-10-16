-- AlterTable
ALTER TABLE "Row" ADD COLUMN     "searchText" TEXT;

-- CreateIndex
CREATE INDEX "Row_tableId_searchText_idx" ON "Row"("tableId", "searchText");
