-- DropIndex
DROP INDEX "building_types_slug_tenant_id_key";
-- DropIndex
DROP INDEX "permissions_slug_key";
-- DropIndex
DROP INDEX "roles_slug_key";
-- DropIndex
DROP INDEX "roles_slug_tenant_id_key";
-- DropIndex
DROP INDEX "tenants_slug_idx";
-- DropIndex
DROP INDEX "tenants_slug_key";
-- AlterTable
ALTER TABLE "building_types" DROP COLUMN "slug";
-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "slug",
ADD COLUMN     "code" TEXT NOT NULL;
-- AlterTable
ALTER TABLE "roles" DROP COLUMN "slug",
ADD COLUMN     "code" TEXT NOT NULL;
-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "slug";
-- CreateIndex
CREATE UNIQUE INDEX "building_types_name_tenant_id_key" ON "building_types"("name", "tenant_id");
-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");
-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");
-- CreateIndex
CREATE UNIQUE INDEX "roles_code_tenant_id_key" ON "roles"("code", "tenant_id");