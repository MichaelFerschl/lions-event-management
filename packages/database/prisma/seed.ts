import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script for Lions Event Management Hub
 *
 * IMPORTANT: After setting up Clerk authentication, update the following:
 * - Tenant.clerkOrgId: Replace "org_demo_lauf" with actual Clerk Organization ID
 * - Member.clerkUserId: Replace "user_placeholder_X" with actual Clerk User IDs
 *
 * This script uses upsert operations to be idempotent (can run multiple times safely).
 */

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Tenant: Lions Club Lauf
  console.log('📍 Creating tenant: Lions Club Lauf...');
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'lauf' },
    update: {},
    create: {
      slug: 'lauf',
      name: 'Lions Club Lauf an der Pegnitz',
      clerkOrgId: 'org_demo_lauf', // TODO: Replace with actual Clerk Org ID
      primaryColor: '#00338D',
      accentColor: '#EBB700',
      email: 'info@lions-lauf.de',
      phone: '+49 9123 12345',
      website: 'https://www.lions-lauf.de',
      address: 'Marktplatz 1, 91207 Lauf an der Pegnitz',
      features: ['events', 'members', 'protocols', 'gallery'],
      plan: 'PREMIUM',
    },
  });
  console.log(`✅ Tenant created: ${tenant.name}`);

  // 2. Create Activity Types
  console.log('🎯 Creating activity types...');
  const activityTypes = [
    {
      name: 'Bobby Car Rennen',
      nameEn: 'Bobby Car Race',
      color: '#FF5B35',
      icon: 'car',
    },
    {
      name: 'Adventskalender-Verkauf',
      nameEn: 'Advent Calendar Sale',
      color: '#00AB68',
      icon: 'calendar',
    },
    {
      name: 'Altstadtfest',
      nameEn: 'Old Town Festival',
      color: '#7A2582',
      icon: 'party',
    },
    {
      name: 'Krapfenaktion',
      nameEn: 'Donut Sale',
      color: '#EBB700',
      icon: 'cookie',
    },
    {
      name: 'Wenzelschloss',
      nameEn: 'Wenzelschloss Event',
      color: '#407CCA',
      icon: 'castle',
    },
  ];

  const createdActivityTypes = await Promise.all(
    activityTypes.map((type) =>
      prisma.activityType.upsert({
        where: {
          tenantId_name: {
            tenantId: tenant.id,
            name: type.name,
          },
        },
        update: {},
        create: {
          tenantId: tenant.id,
          ...type,
        },
      })
    )
  );
  console.log(`✅ Created ${createdActivityTypes.length} activity types`);

  // 3. Create Members
  console.log('👥 Creating members...');
  const members = [
    {
      clerkUserId: 'user_placeholder_admin',
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'admin@lions-lauf.de',
      phone: '+49 9123 11111',
      memberNumber: 'LC-001',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
      joinDate: new Date('2020-01-15'),
    },
    {
      clerkUserId: 'user_placeholder_board',
      firstName: 'Eva',
      lastName: 'Vorstand',
      email: 'vorstand@lions-lauf.de',
      phone: '+49 9123 22222',
      memberNumber: 'LC-002',
      role: 'BOARD' as const,
      status: 'ACTIVE' as const,
      joinDate: new Date('2021-03-10'),
      sponsor: 'Max Mustermann',
    },
    {
      clerkUserId: 'user_placeholder_member',
      firstName: 'Hans',
      lastName: 'Mitglied',
      email: 'mitglied@lions-lauf.de',
      phone: '+49 9123 33333',
      memberNumber: 'LC-003',
      role: 'MEMBER' as const,
      status: 'ACTIVE' as const,
      joinDate: new Date('2022-06-20'),
      sponsor: 'Eva Vorstand',
    },
    {
      clerkUserId: 'user_placeholder_guest',
      firstName: 'Gabi',
      lastName: 'Gast',
      email: 'gast@example.de',
      role: 'GUEST' as const,
      status: 'ACTIVE' as const,
    },
  ];

  const createdMembers = await Promise.all(
    members.map((member) =>
      prisma.member.upsert({
        where: {
          tenantId_clerkUserId: {
            tenantId: tenant.id,
            clerkUserId: member.clerkUserId,
          },
        },
        update: {},
        create: {
          tenantId: tenant.id,
          ...member,
        },
      })
    )
  );
  console.log(`✅ Created ${createdMembers.length} members`);

  // Get members for event creation
  const adminMember = createdMembers[0];
  const boardMember = createdMembers[1];
  const regularMember = createdMembers[2];

  // Get activity type for Bobby Car event
  const bobbyCarType = createdActivityTypes.find(
    (type) => type.name === 'Bobby Car Rennen'
  );

  // 4. Create Events
  console.log('📅 Creating events...');

  // Helper function to get date relative to now
  const getDate = (daysFromNow: number, hours = 19, minutes = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Event 1: Reguläres Clubtreffen
  const clubMeeting = await prisma.event.upsert({
    where: {
      id: 'seed_event_club_meeting',
    },
    update: {},
    create: {
      id: 'seed_event_club_meeting',
      tenantId: tenant.id,
      createdById: adminMember.id,
      title: 'Reguläres Clubtreffen',
      titleEn: 'Regular Club Meeting',
      description:
        'Unser monatliches Clubtreffen mit Abendessen und Programm. Alle Mitglieder sind herzlich eingeladen!',
      descriptionEn:
        'Our monthly club meeting with dinner and program. All members are cordially invited!',
      type: 'REGULAR_MEETING',
      location: 'Restaurant Zum Löwen',
      locationUrl: 'https://maps.google.com',
      startDate: getDate(7), // Next week Wednesday
      endDate: getDate(7, 22, 0), // Same day, 22:00
      registrationRequired: true,
      registrationDeadline: getDate(5), // 2 days before
      allowGuests: true,
      maxGuestsPerMember: 2,
      costMember: 25.0,
      costGuest: 30.0,
      visibility: 'MEMBERS',
      isPublished: true,
      reminderDays: [7, 3, 1],
    },
  });
  console.log(`✅ Event created: ${clubMeeting.title}`);

  // Event 2: Vorstandssitzung
  const boardMeeting = await prisma.event.upsert({
    where: {
      id: 'seed_event_board_meeting',
    },
    update: {},
    create: {
      id: 'seed_event_board_meeting',
      tenantId: tenant.id,
      createdById: boardMember.id,
      title: 'Vorstandssitzung',
      titleEn: 'Board Meeting',
      description:
        'Monatliche Vorstandssitzung zur Besprechung aktueller Themen und Planung kommender Aktivitäten.',
      descriptionEn:
        'Monthly board meeting to discuss current topics and plan upcoming activities.',
      type: 'BOARD_MEETING',
      isOnline: true,
      onlineUrl: 'https://meet.google.com/xyz-abc-def',
      startDate: getDate(3, 18, 0), // In 3 days, 18:00
      endDate: getDate(3, 20, 0), // Same day, 20:00
      registrationRequired: false,
      visibility: 'BOARD',
      isPublished: true,
      reminderDays: [3, 1],
    },
  });
  console.log(`✅ Event created: ${boardMeeting.title}`);

  // Event 3: Bobby Car Rennen 2025
  const bobbyCarRace = await prisma.event.upsert({
    where: {
      id: 'seed_event_bobby_car',
    },
    update: {},
    create: {
      id: 'seed_event_bobby_car',
      tenantId: tenant.id,
      createdById: adminMember.id,
      categoryId: bobbyCarType?.id,
      title: 'Bobby Car Rennen 2025',
      titleEn: 'Bobby Car Race 2025',
      description:
        'Unser jährliches Bobby Car Rennen! Teams aus der Region treten gegeneinander an. Für Verpflegung und Unterhaltung ist gesorgt. Helfer werden dringend gesucht!',
      descriptionEn:
        'Our annual Bobby Car Race! Teams from the region compete against each other. Food and entertainment provided. Volunteers urgently needed!',
      type: 'ACTIVITY',
      location: 'Marktplatz Lauf',
      locationUrl: 'https://maps.google.com/marktplatz-lauf',
      startDate: getDate(30, 10, 0), // In 30 days, 10:00
      endDate: getDate(30, 16, 0), // Same day, 16:00
      allDay: false,
      registrationRequired: true,
      registrationDeadline: getDate(23),
      maxParticipants: 50,
      allowGuests: true,
      maxGuestsPerMember: 5,
      costMember: 0.0,
      costGuest: 5.0,
      visibility: 'PUBLIC',
      isPublished: true,
      reminderDays: [14, 7, 3, 1],
    },
  });
  console.log(`✅ Event created: ${bobbyCarRace.title}`);

  // Event 4: Jahreshauptversammlung
  const generalAssembly = await prisma.event.upsert({
    where: {
      id: 'seed_event_general_assembly',
    },
    update: {},
    create: {
      id: 'seed_event_general_assembly',
      tenantId: tenant.id,
      createdById: adminMember.id,
      title: 'Jahreshauptversammlung 2025',
      titleEn: 'Annual General Assembly 2025',
      description:
        'Unsere jährliche Mitgliederversammlung mit Jahresrückblick, Kassenbericht, Entlastung des Vorstands und Wahlen. Anwesenheit aller Mitglieder erwünscht!',
      descriptionEn:
        'Our annual general assembly with year review, financial report, board discharge and elections. Attendance of all members desired!',
      type: 'GENERAL_ASSEMBLY',
      location: 'Vereinsheim',
      startDate: getDate(45, 19, 0), // In 45 days, 19:00
      endDate: getDate(45, 22, 0), // Same day, 22:00
      registrationRequired: true,
      registrationDeadline: getDate(38),
      allowGuests: false,
      visibility: 'MEMBERS',
      isPublished: true,
      reminderDays: [14, 7, 3, 1],
    },
  });
  console.log(`✅ Event created: ${generalAssembly.title}`);

  // 5. Create Event Registrations for Club Meeting
  console.log('📝 Creating event registrations...');

  // Admin: Registered
  await prisma.eventRegistration.upsert({
    where: {
      eventId_memberId: {
        eventId: clubMeeting.id,
        memberId: adminMember.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      eventId: clubMeeting.id,
      memberId: adminMember.id,
      status: 'REGISTERED',
      guestCount: 0,
      totalCost: 25.0,
      isPaid: true,
      paidAt: new Date(),
    },
  });

  // Board Member: Registered with 1 guest
  await prisma.eventRegistration.upsert({
    where: {
      eventId_memberId: {
        eventId: clubMeeting.id,
        memberId: boardMember.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      eventId: clubMeeting.id,
      memberId: boardMember.id,
      status: 'REGISTERED',
      guestCount: 1,
      guestNames: ['Maria Vorstand'],
      totalCost: 55.0, // 25 (member) + 30 (guest)
      isPaid: false,
    },
  });

  // Regular Member: Maybe
  await prisma.eventRegistration.upsert({
    where: {
      eventId_memberId: {
        eventId: clubMeeting.id,
        memberId: regularMember.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      eventId: clubMeeting.id,
      memberId: regularMember.id,
      status: 'MAYBE',
      guestCount: 0,
      comment: 'Muss noch meinen Terminkalender prüfen',
    },
  });

  console.log('✅ Created 3 event registrations');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   • 1 Tenant: ${tenant.name}`);
  console.log(`   • ${createdActivityTypes.length} Activity Types`);
  console.log(`   • ${createdMembers.length} Members`);
  console.log('   • 4 Events');
  console.log('   • 3 Event Registrations');
  console.log(
    '\n⚠️  Remember to update clerkOrgId and clerkUserId values after Clerk setup!'
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
