import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
}

const prisma = new PrismaClient();

/**
 * This script links a Supabase Auth user to an existing member.
 *
 * Usage:
 *   npx tsx prisma/link-auth-user.ts <member-email>
 *
 * You need to set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.
 */

async function main() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.log('Usage: npx tsx prisma/link-auth-user.ts <member-email>');
    console.log('\nExample: npx tsx prisma/link-auth-user.ts admin@lions-lauf.de');
    console.log('\nAvailable members:');
    const members = await prisma.member.findMany({
      select: { email: true, firstName: true, lastName: true, authUserId: true },
    });
    for (const m of members) {
      const linked = m.authUserId ? '(linked)' : '(not linked)';
      console.log(`  - ${m.email} ${linked}`);
    }
    return;
  }

  // Find member by email
  const member = await prisma.member.findFirst({
    where: { email: targetEmail },
    include: { assignedRole: true },
  });

  if (!member) {
    console.log(`❌ Member with email "${targetEmail}" not found.`);
    return;
  }

  console.log(`Found member: ${member.firstName} ${member.lastName} (${member.email})`);
  console.log(`Current authUserId: ${member.authUserId || 'not linked'}`);
  console.log(`Assigned role: ${member.assignedRole?.name || 'none'}`);

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.log('\n⚠️ Cannot access Supabase to get auth users.');
    console.log('To automatically link users, set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    console.log('\nAlternatively, you can manually update the authUserId in the database.');
    console.log('Run this SQL:');
    console.log(`  UPDATE members SET "authUserId" = '<your-supabase-auth-user-id>' WHERE email = '${targetEmail}';`);
    return;
  }

  // Connect to Supabase Admin
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // List auth users
  console.log('\nFetching Supabase Auth users...');
  const { data: authUsersData, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.log(`❌ Error fetching auth users: ${error.message}`);
    return;
  }

  const authUsers = authUsersData.users;
  console.log(`Found ${authUsers.length} auth user(s):\n`);

  for (const user of authUsers) {
    console.log(`  - ${user.email} (ID: ${user.id})`);
  }

  // Check if a specific auth user ID was provided
  const specifiedAuthUserId = process.argv[3];

  if (specifiedAuthUserId) {
    // Use the specified auth user ID
    const specifiedAuthUser = authUsers.find(u => u.id === specifiedAuthUserId);
    if (!specifiedAuthUser) {
      console.log(`\n❌ Auth user with ID "${specifiedAuthUserId}" not found.`);
      return;
    }

    console.log(`\n🔗 Linking to specified auth user: ${specifiedAuthUser.email}`);

    await prisma.member.update({
      where: { id: member.id },
      data: { authUserId: specifiedAuthUser.id, isActive: true },
    });

    console.log(`✅ Member "${member.email}" linked to auth user: ${specifiedAuthUser.email} (${specifiedAuthUser.id})`);
    return;
  }

  // Try to find matching auth user by email
  const matchingAuthUser = authUsers.find(u => u.email === member.email);

  if (matchingAuthUser) {
    console.log(`\n✅ Found matching auth user: ${matchingAuthUser.email}`);
    console.log('Linking member to auth user...');

    await prisma.member.update({
      where: { id: member.id },
      data: { authUserId: matchingAuthUser.id, isActive: true },
    });

    console.log(`✅ Member "${member.email}" linked to auth user ID: ${matchingAuthUser.id}`);
  } else {
    console.log(`\n⚠️ No auth user found with email "${member.email}"`);
    console.log('You can manually link by running:');
    console.log(`  UPDATE members SET "authUserId" = '<auth-user-id>' WHERE email = '${targetEmail}';`);

    if (authUsers.length > 0) {
      console.log('\nOr link to one of the existing auth users by specifying the ID:');
      console.log(`  npx tsx prisma/link-auth-user.ts ${targetEmail} <auth-user-id>`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
