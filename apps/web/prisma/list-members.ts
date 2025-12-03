import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const members = await prisma.member.findMany({
    include: {
      assignedRole: {
        include: { rolePermissions: { include: { permission: true } } }
      }
    },
  });

  console.log('All members:\n');
  for (const m of members) {
    console.log(`- ${m.firstName} ${m.lastName} (${m.email})`);
    console.log(`  authUserId: ${m.authUserId || 'null'}`);
    console.log(`  roleId: ${m.roleId || 'null'}`);
    console.log(`  assignedRole: ${m.assignedRole?.name || 'none'}`);
    console.log(`  isActive: ${m.isActive}`);
    if (m.assignedRole?.rolePermissions) {
      const perms = m.assignedRole.rolePermissions.map(rp => rp.permission.code);
      console.log(`  permissions: ${perms.length > 0 ? perms.join(', ') : 'none'}`);
    }
    console.log('');
  }
}

main().finally(() => prisma.$disconnect());
