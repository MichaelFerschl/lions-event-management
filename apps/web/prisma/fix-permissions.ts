import { PrismaClient } from '@prisma/client';
import { seedPermissions, createRolesForTenant } from './seed-permissions';

const prisma = new PrismaClient();

/**
 * Fix script to set up permissions and assign Admin role to first member
 *
 * This script will:
 * 1. Seed all permissions
 * 2. Create roles for all tenants
 * 3. Assign Admin role to members who don't have a role assigned
 */

async function main() {
  console.log('🔧 Starting permission fix...\n');

  // 1. Seed permissions
  console.log('1️⃣ Seeding permissions...');
  await seedPermissions();
  console.log('   ✅ Permissions seeded\n');

  // 2. Get all tenants
  const tenants = await prisma.tenant.findMany();
  console.log(`2️⃣ Found ${tenants.length} tenant(s)\n`);

  for (const tenant of tenants) {
    console.log(`📍 Processing tenant: ${tenant.name} (${tenant.slug})`);

    // 3. Create roles for tenant
    console.log('   Creating roles...');
    await createRolesForTenant(tenant.id);
    console.log('   ✅ Roles created\n');

    // 4. Get Admin role for this tenant
    const adminRole = await prisma.role.findFirst({
      where: {
        tenantId: tenant.id,
        type: 'ADMIN',
      },
    });

    if (!adminRole) {
      console.log('   ⚠️ Admin role not found, skipping member assignment\n');
      continue;
    }

    // 5. Find members without assigned role
    const membersWithoutRole = await prisma.member.findMany({
      where: {
        tenantId: tenant.id,
        roleId: null,
      },
    });

    console.log(`   Found ${membersWithoutRole.length} member(s) without assigned role`);

    // 6. Get all roles for this tenant
    const allRoles = await prisma.role.findMany({
      where: { tenantId: tenant.id },
    });

    // 7. Assign roles to all members without one
    for (const member of membersWithoutRole) {
      // Members with authUserId (real users) or isActive get Admin role
      // Others get a role matching their legacy 'role' field
      let roleToAssign = adminRole;

      if (!member.authUserId && !member.isActive) {
        // Try to match by legacy role field
        const matchingRole = allRoles.find(r => r.type === member.role);
        if (matchingRole) {
          roleToAssign = matchingRole;
        }
      }

      await prisma.member.update({
        where: { id: member.id },
        data: { roleId: roleToAssign.id },
      });
      console.log(`   ✅ Assigned ${roleToAssign.name} role to: ${member.firstName} ${member.lastName} (${member.email})`);
    }

    // 7. List all members and their roles
    console.log('\n   📋 Current members and roles:');
    const allMembers = await prisma.member.findMany({
      where: { tenantId: tenant.id },
      include: { assignedRole: true },
    });

    for (const member of allMembers) {
      const roleName = member.assignedRole?.name || '❌ No role assigned';
      console.log(`      - ${member.firstName} ${member.lastName} (${member.email}): ${roleName}`);
    }
    console.log('');
  }

  // 8. Summary
  const totalPermissions = await prisma.permission.count();
  const totalRoles = await prisma.role.count();
  const membersWithRoles = await prisma.member.count({ where: { roleId: { not: null } } });
  const membersWithoutRoles = await prisma.member.count({ where: { roleId: null } });

  console.log('📊 Summary:');
  console.log(`   • ${totalPermissions} permissions in database`);
  console.log(`   • ${totalRoles} roles across all tenants`);
  console.log(`   • ${membersWithRoles} member(s) with assigned roles`);
  console.log(`   • ${membersWithoutRoles} member(s) without roles`);

  console.log('\n🎉 Permission fix complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
