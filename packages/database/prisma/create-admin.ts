import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createFirstAdmin() {
  // Diese Werte anpassen:
  const ADMIN_EMAIL = 'admin@lions-lauf.de'; // Deine Email
  const SUPABASE_AUTH_USER_ID = process.argv[2]; // Wird als Argument übergeben

  if (!SUPABASE_AUTH_USER_ID) {
    console.error('❌ Bitte Supabase Auth User ID als Argument übergeben!');
    console.log('   Verwendung: npx tsx prisma/create-admin.ts <AUTH_USER_ID>');
    console.log('');
    console.log('   So findest du die Auth User ID:');
    console.log('   1. Gehe zu Supabase Dashboard → Authentication → Users');
    console.log('   2. Erstelle einen User mit "Add user" → "Create new user"');
    console.log('   3. Kopiere die "User UID" (die lange ID)');
    process.exit(1);
  }

  // Tenant finden (der erste/einzige)
  const tenant = await prisma.tenant.findFirst();

  if (!tenant) {
    console.error('❌ Kein Tenant gefunden! Bitte erst seed.ts ausführen.');
    process.exit(1);
  }

  console.log(`📍 Tenant gefunden: ${tenant.name}`);

  // Admin-Rolle finden
  const adminRole = await prisma.role.findUnique({
    where: {
      tenantId_type: {
        tenantId: tenant.id,
        type: 'ADMIN',
      },
    },
  });

  if (!adminRole) {
    console.error(
      '❌ Admin-Rolle nicht gefunden! Bitte erst seed-permissions.ts ausführen.'
    );
    process.exit(1);
  }

  console.log(`👑 Admin-Rolle gefunden: ${adminRole.name}`);

  // Prüfen ob Member bereits existiert
  const existingMember = await prisma.member.findUnique({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: ADMIN_EMAIL,
      },
    },
  });

  if (existingMember) {
    // Update mit authUserId
    await prisma.member.update({
      where: { id: existingMember.id },
      data: {
        authUserId: SUPABASE_AUTH_USER_ID,
        roleId: adminRole.id,
        role: 'ADMIN',
        status: 'ACTIVE',
        isActive: true,
      },
    });
    console.log(`✅ Bestehendes Mitglied "${ADMIN_EMAIL}" als Admin aktiviert!`);
  } else {
    // Neuen Member erstellen
    await prisma.member.create({
      data: {
        tenantId: tenant.id,
        authUserId: SUPABASE_AUTH_USER_ID,
        email: ADMIN_EMAIL,
        firstName: 'Admin',
        lastName: 'User',
        roleId: adminRole.id,
        role: 'ADMIN',
        status: 'ACTIVE',
        isActive: true,
      },
    });
    console.log(`✅ Admin-User "${ADMIN_EMAIL}" erstellt!`);
  }

  console.log('');
  console.log('🎉 Du kannst dich jetzt einloggen!');
}

createFirstAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
