import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';
import { PERMISSIONS, PLATFORM_ROLES, BUILDING_TYPES } from '../src/constants/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const permissions = Object.entries(PERMISSIONS).map(([key, code]) => ({
    name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    code,
    module: code.split(':')[0],
  }));

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }
  console.log(`Created ${permissions.length} permissions`);

  const allPermissions = await prisma.permission.findMany();

  let superAdminRole = await prisma.role.findFirst({
    where: { code: PLATFORM_ROLES.SUPER_ADMIN, tenantId: null },
  });

  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: {
        name: 'Super Admin',
        code: PLATFORM_ROLES.SUPER_ADMIN,
        scope: 'PLATFORM',
        isSystem: true,
      },
    });
  }

  let supportRole = await prisma.role.findFirst({
    where: { code: PLATFORM_ROLES.SUPPORT, tenantId: null },
  });

  if (!supportRole) {
    supportRole = await prisma.role.create({
      data: {
        name: 'Support',
        code: PLATFORM_ROLES.SUPPORT,
        scope: 'PLATFORM',
        isSystem: true,
      },
    });
  }

  const platformPerms = allPermissions.filter((p) => p.code.startsWith('platform:') || p.code.startsWith('tenants:'));
  for (const perm of platformPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }

  const supportPerms = allPermissions.filter((p) => p.code.startsWith('platform:support') || p.code.startsWith('tenants:read'));
  for (const perm of supportPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: supportRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: supportRole.id, permissionId: perm.id },
    });
  }

  await prisma.platformUser.upsert({
    where: { email: 'admin@ezehub.com' },
    update: {},
    create: {
      email: 'admin@ezehub.com',
      passwordHash: await hashPassword('Admin@123456'),
      firstName: 'Super',
      lastName: 'Admin',
      roleId: superAdminRole.id,
    },
  });

  console.log('Platform admin created: admin@ezehub.com / Admin@123456');

  for (const bt of BUILDING_TYPES) {
    const existing = await prisma.buildingType.findFirst({
      where: { name: bt.name, tenantId: null },
    });
    if (!existing) {
      await prisma.buildingType.create({
        data: { name: bt.name, isSystem: true },
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
