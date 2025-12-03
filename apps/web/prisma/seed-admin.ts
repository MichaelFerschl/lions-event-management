import { PrismaClient } from '@prisma/client';
import { seedPermissions, createRolesForTenant } from './seed-permissions';

const prisma = new PrismaClient();

/**
 * Minimal Seed Script - Creates only:
 * - 1 Tenant (Lions Club)
 * - 1 Admin User (needs to be linked to Supabase Auth)
 * - Permissions and Roles
 *
 * After running this script:
 * 1. Create a user in Supabase Auth with the admin email
 * 2. Link the authUserId using the link-auth-user.ts script
 */

async function main() {
  console.log('🌱 Starting minimal database seed...\n');

  // Configuration - ADJUST THESE VALUES
  const ADMIN_EMAIL = 'admin@lions-hub.de'; // Email for the admin user
  const ADMIN_FIRST_NAME = 'Admin';
  const ADMIN_LAST_NAME = 'User';
  const CLUB_NAME = 'Lions Club Demo';
  const CLUB_SLUG = 'demo';
  const CLUB_NUMBER = '000001';

  // 1. RESET: Delete all existing data (in correct order due to foreign keys)
  console.log('🗑️  Resetting database...');

  await prisma.rolePermission.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.plannedEvent.deleteMany({});
  await prisma.lionsYear.deleteMany({});
  await prisma.eventRegistration.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.eventTemplate.deleteMany({});
  await prisma.recurringRule.deleteMany({});
  await prisma.eventCategory.deleteMany({});
  await prisma.activityType.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log('✅ Database reset complete\n');

  // 2. Create Tenant
  console.log(`📍 Creating tenant: ${CLUB_NAME}...`);
  const tenant = await prisma.tenant.create({
    data: {
      slug: CLUB_SLUG,
      name: CLUB_NAME,
      clubNumber: CLUB_NUMBER,
      primaryColor: '#00338D', // Lions Blue
      accentColor: '#EBB700', // Lions Yellow
      email: `info@${CLUB_SLUG}.lions-hub.de`,
      features: ['events', 'members', 'planning'],
      plan: 'PREMIUM',
      websiteEnabled: true,
      websiteTitle: CLUB_NAME,
      heroText: `Willkommen beim ${CLUB_NAME}. Wir helfen - We Serve!`,
      aboutText: `Der ${CLUB_NAME} ist Teil von Lions Clubs International, der weltweit größten Service-Organisation.`,
      contactEmail: `kontakt@${CLUB_SLUG}.lions-hub.de`,
    },
  });
  console.log(`✅ Tenant created: ${tenant.name} (ID: ${tenant.id})\n`);

  // 3. Seed Permissions and Roles
  console.log('🔐 Setting up permissions and roles...');
  await seedPermissions();
  await createRolesForTenant(tenant.id);

  // Get the ADMIN role
  const adminRole = await prisma.role.findFirst({
    where: {
      tenantId: tenant.id,
      type: 'ADMIN',
    },
  });

  if (!adminRole) {
    throw new Error('Admin role not found after seeding!');
  }
  console.log(`✅ Permissions and roles created\n`);

  // 4. Create Admin Member (without authUserId - needs to be linked later)
  console.log(
    `👤 Creating admin member: ${ADMIN_FIRST_NAME} ${ADMIN_LAST_NAME}...`
  );
  const adminMember = await prisma.member.create({
    data: {
      tenantId: tenant.id,
      email: ADMIN_EMAIL,
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      roleId: adminRole.id,
      isActive: true,
      // authUserId will be set after Supabase user is created
    },
  });
  console.log(
    `✅ Admin member created: ${adminMember.email} (ID: ${adminMember.id})\n`
  );

  // Summary
  const permissionsCount = await prisma.permission.count();
  const rolesCount = await prisma.role.count({
    where: { tenantId: tenant.id },
  });

  console.log(
    '═══════════════════════════════════════════════════════════════'
  );
  console.log('🎉 Minimal database seeding completed successfully!');
  console.log(
    '═══════════════════════════════════════════════════════════════'
  );
  console.log('\n📊 Summary:');
  console.log(`   • Tenant: ${tenant.name}`);
  console.log(`   • Tenant Slug: ${tenant.slug}`);
  console.log(`   • Club Number: ${tenant.clubNumber}`);
  console.log(`   • Admin Email: ${ADMIN_EMAIL}`);
  console.log(`   • Permissions: ${permissionsCount}`);
  console.log(`   • Roles: ${rolesCount}`);

  console.log('\n📋 Next Steps:');
  console.log(
    '   1. Create a user in Supabase Auth Dashboard with email:',
    ADMIN_EMAIL
  );
  console.log('   2. Copy the User UID from Supabase');
  console.log(
    '   3. Run: npx ts-node prisma/link-auth-user.ts <SUPABASE_USER_UID>'
  );
  console.log('   4. Sign in to the app with your admin credentials');
  console.log('   5. Invite additional members through the app');

  console.log('\n🔗 Public Website URL (after deployment):');
  console.log(`   https://${CLUB_SLUG}-${CLUB_NUMBER}.lions-hub.de`);
  console.log(
    '═══════════════════════════════════════════════════════════════\n'
  );
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
