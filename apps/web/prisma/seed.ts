import { PrismaClient } from '@prisma/client';
import { seedPermissions, createRolesForTenant } from './seed-permissions';

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

  // 0. RESET: Delete all existing data (in correct order due to foreign keys)
  console.log('🗑️  Resetting database...');

  // Delete in reverse order of dependencies
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

  console.log('✅ Database reset complete');

  // 1. Create Tenant: Lions Club Lauf
  console.log('📍 Creating tenant: Lions Club Lauf...');
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'lauf' },
    update: {},
    create: {
      slug: 'lauf',
      name: 'Lions Club Lauf an der Pegnitz',
      clerkOrgId: 'org_demo_lauf', // TODO: Replace with actual Clerk Org ID
      clubNumber: '123456', // Lions Club Nummer
      primaryColor: '#00338D',
      accentColor: '#EBB700',
      email: 'info@lions-lauf.de',
      phone: '+49 9123 12345',
      website: 'https://www.lions-lauf.de',
      address: 'Marktplatz 1, 91207 Lauf an der Pegnitz',
      features: ['events', 'members', 'protocols', 'gallery'],
      plan: 'PREMIUM',
      // Website-Konfiguration
      websiteEnabled: true,
      websiteTitle: 'Lions Club Lauf an der Pegnitz',
      websiteLogo: '/images/lions-lauf-logo.png',
      heroImage: '/images/hero-lauf.jpg',
      heroText:
        'Wir sind der Lions Club Lauf an der Pegnitz. Seit über 40 Jahren engagieren wir uns für soziale Projekte in unserer Region. Gemeinsam machen wir die Welt ein Stück besser.',
      aboutText:
        'Der Lions Club Lauf an der Pegnitz wurde 1982 gegründet und ist Teil von Lions Clubs International, der weltweit größten Service-Organisation. Mit über 40 engagierten Mitgliedern setzen wir uns für Menschen in Not ein, unterstützen lokale Projekte und fördern das Gemeinwohl in unserer Region.\n\nUnsere Schwerpunkte:\n• Jugendförderung und Bildung\n• Unterstützung von Menschen mit Behinderungen\n• Hilfe für Bedürftige in der Region\n• Internationale Hilfsprojekte\n\nWir freuen uns auf Ihre Unterstützung!',
      contactEmail: 'kontakt@lions-lauf.de',
      contactPhone: '+49 9123 12345',
      contactAddress: 'Lions Club Lauf\nMarktplatz 1\n91207 Lauf an der Pegnitz',
      socialFacebook: 'https://www.facebook.com/lionsclublauf',
      socialInstagram: 'https://www.instagram.com/lionsclublauf',
      socialLinkedin: 'https://www.linkedin.com/company/lions-club-lauf',
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
      isPublic: true, // Auf öffentlicher Club-Website sichtbar (Gäste willkommen)
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
      isPublic: true, // Auf öffentlicher Club-Website sichtbar
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

  // 6. Create Event Categories for Lions Year Planning
  console.log('📂 Creating event categories...');
  const eventCategories = [
    {
      name: 'Clubabend',
      color: '#00338D', // Lions Blue
      icon: 'users',
      isDefault: true,
      sortOrder: 1,
    },
    {
      name: 'Activity',
      color: '#FF5B35', // Orange
      icon: 'star',
      isDefault: true,
      sortOrder: 2,
    },
    {
      name: 'Mitgliederversammlung',
      color: '#7A2582', // Purple
      icon: 'clipboard',
      isDefault: true,
      sortOrder: 3,
    },
    {
      name: 'Vorstandssitzung',
      color: '#407CCA', // Light Blue
      icon: 'briefcase',
      isDefault: true,
      sortOrder: 4,
    },
    {
      name: 'Sonstiges',
      color: '#6B7280', // Gray
      icon: 'dots',
      isDefault: true,
      sortOrder: 5,
    },
  ];

  const createdCategories = await Promise.all(
    eventCategories.map((category) =>
      prisma.eventCategory.upsert({
        where: {
          tenantId_name: {
            tenantId: tenant.id,
            name: category.name,
          },
        },
        update: {},
        create: {
          tenantId: tenant.id,
          ...category,
        },
      })
    )
  );
  console.log(`✅ Created ${createdCategories.length} event categories`);

  // Get categories for templates
  const clubabendCategory = createdCategories.find((c) => c.name === 'Clubabend');
  const activityCategory = createdCategories.find((c) => c.name === 'Activity');
  const versammlungCategory = createdCategories.find(
    (c) => c.name === 'Mitgliederversammlung'
  );

  // 7. Create Recurring Rules
  console.log('🔄 Creating recurring rules...');
  const recurringRules = [
    {
      name: 'Erster Dienstag im Monat',
      description: 'Clubabend findet am ersten Dienstag jeden Monats statt',
      frequency: 'MONTHLY' as const,
      dayOfWeek: 2, // Dienstag
      weekOfMonth: 1, // Erste Woche
      defaultCategoryId: clubabendCategory?.id,
      defaultTitle: 'Clubabend',
      isActive: true,
    },
    {
      name: 'Letzter Donnerstag im Monat',
      description: 'Stammtisch am letzten Donnerstag jeden Monats',
      frequency: 'MONTHLY' as const,
      dayOfWeek: 4, // Donnerstag
      weekOfMonth: -1, // Letzte Woche
      defaultCategoryId: clubabendCategory?.id,
      defaultTitle: 'Stammtisch',
      isActive: true,
    },
  ];

  const createdRules = await Promise.all(
    recurringRules.map((rule) =>
      prisma.recurringRule.upsert({
        where: {
          tenantId_name: {
            tenantId: tenant.id,
            name: rule.name,
          },
        },
        update: {},
        create: {
          tenantId: tenant.id,
          ...rule,
        },
      })
    )
  );
  console.log(`✅ Created ${createdRules.length} recurring rules`);

  // 8. Create Event Templates
  console.log('📋 Creating event templates...');
  const eventTemplates = [
    {
      categoryId: versammlungCategory?.id || '',
      name: 'Mitgliederversammlung',
      description:
        'Jährliche Mitgliederversammlung mit Rechenschaftsbericht, Entlastung des Vorstands und Wahlen.',
      defaultInvitationText:
        'Liebe Mitglieder,\n\nhiermit laden wir Sie herzlich zu unserer jährlichen Mitgliederversammlung ein. Bitte bestätigen Sie Ihre Teilnahme bis zum genannten Anmeldeschluss.\n\nTagesordnung:\n1. Begrüßung\n2. Rechenschaftsbericht des Präsidenten\n3. Kassenbericht\n4. Entlastung des Vorstands\n5. Wahlen\n6. Verschiedenes\n\nWir freuen uns auf Ihr Kommen!\n\nMit freundlichen Grüßen\nDer Vorstand',
      isMandatory: true,
      defaultMonth: 3, // März
      defaultDurationMinutes: 180,
      isActive: true,
    },
    {
      categoryId: activityCategory?.id || '',
      name: 'Bobby Car Rennen',
      description:
        'Unser jährliches Bobby Car Rennen - das Highlight für die ganze Familie!',
      defaultInvitationText:
        'Liebe Mitglieder und Freunde,\n\nes ist wieder soweit: Das Bobby Car Rennen steht vor der Tür!\n\nWir benötigen dringend Helfer für:\n- Auf- und Abbau\n- Streckenposten\n- Verpflegungsstand\n- Moderation\n\nBitte meldet euch über das Anmeldeformular an und gebt an, in welchem Bereich ihr helfen könnt.\n\nWir freuen uns auf eure Unterstützung!\n\nDas Orga-Team',
      isMandatory: false,
      defaultMonth: 6, // Juni
      defaultDurationMinutes: 360,
      isActive: true,
    },
    {
      categoryId: activityCategory?.id || '',
      name: 'Adventskalenderaktion',
      description:
        'Verkauf der Lions Adventskalender zur Finanzierung sozialer Projekte.',
      defaultInvitationText:
        'Liebe Mitglieder,\n\nunsere beliebte Adventskalenderaktion startet bald! Die Kalender sind eingetroffen und warten auf den Verkauf.\n\nWir suchen Verkäufer für:\n- Innenstadt-Stände\n- Firmenverkauf\n- Schulen und Kindergärten\n\nJeder verkaufte Kalender hilft uns, soziale Projekte in unserer Region zu unterstützen.\n\nMeldet euch bitte an, damit wir die Einsätze koordinieren können.\n\nHerzlichen Dank!\nDas Activity-Team',
      isMandatory: false,
      defaultMonth: 11, // November
      defaultDurationMinutes: 240,
      isActive: true,
    },
  ];

  const createdTemplates = await Promise.all(
    eventTemplates
      .filter((template) => template.categoryId) // Nur wenn Kategorie vorhanden
      .map((template) =>
        prisma.eventTemplate.upsert({
          where: {
            tenantId_name: {
              tenantId: tenant.id,
              name: template.name,
            },
          },
          update: {},
          create: {
            tenantId: tenant.id,
            ...template,
          },
        })
      )
  );
  console.log(`✅ Created ${createdTemplates.length} event templates`);

  // 9. Create Lions Year 2026/2027 with Planned Events
  console.log('📆 Creating Lions Year 2026/2027...');

  // Get categories for planned events
  const clubabend = createdCategories.find((c) => c.name === 'Clubabend');
  const activity = createdCategories.find((c) => c.name === 'Activity');
  const mitgliederversammlung = createdCategories.find((c) => c.name === 'Mitgliederversammlung');
  const vorstandssitzung = createdCategories.find((c) => c.name === 'Vorstandssitzung');
  const sonstiges = createdCategories.find((c) => c.name === 'Sonstiges');

  // Check if Lions Year already exists
  const existingLionsYear = await prisma.lionsYear.findFirst({
    where: {
      tenantId: tenant.id,
      name: 'Lionsjahr 2026/2027',
    },
  });

  let lionsYear2627: { id: string; name: string };
  let plannedEventsCount = 0;
  let shouldCreateEvents = false;

  if (existingLionsYear) {
    lionsYear2627 = existingLionsYear;
    // Check if events exist for this year
    const existingEventsCount = await prisma.plannedEvent.count({
      where: { lionsYearId: existingLionsYear.id },
    });
    if (existingEventsCount === 0) {
      console.log('   Lions Year 2026/2027 exists but has no events, creating events...');
      shouldCreateEvents = true;
    } else {
      console.log(`   Lions Year 2026/2027 already exists with ${existingEventsCount} events, skipping...`);
    }
  } else {
    // Create Lions Year
    lionsYear2627 = await prisma.lionsYear.create({
      data: {
        tenantId: tenant.id,
        name: 'Lionsjahr 2026/2027',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2027-06-30'),
        status: 'ACTIVE',
        isArchived: false,
      },
    });
    console.log(`✅ Lions Year created: ${lionsYear2627.name}`);
    shouldCreateEvents = true;
  }

  if (shouldCreateEvents) {

    // Define all planned events
    const plannedEventsData = [
      // JULI 2026
      {
        categoryId: sonstiges?.id,
        date: new Date('2026-07-05T10:00:00'),
        title: 'Präsidentschaftsübergabe',
        description: 'Feierliche Übergabe der Präsidentschaft für das neue Lionsjahr.\n\nOrt: Dehnberg',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: clubabend?.id,
        date: new Date('2026-07-09T19:00:00'),
        title: 'Gastvortrag',
        description: 'Clubabend mit Gastvortrag.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: clubabend?.id,
        date: new Date('2026-07-30T18:00:00'),
        title: 'Geselliges Zusammensein am Backofen',
        description: 'Gemütlicher Abend mit traditionellem Backen.\n\nOrt: CJT Gymnasium',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },

      // AUGUST 2026
      {
        categoryId: clubabend?.id,
        date: new Date('2026-08-04T19:00:00'),
        title: 'Ferienstammtisch',
        description: 'Lockerer Stammtisch während der Ferienzeit.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: clubabend?.id,
        date: new Date('2026-08-20T19:00:00'),
        title: 'Ferienstammtisch',
        description: 'Lockerer Stammtisch während der Ferienzeit.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },

      // SEPTEMBER 2026
      {
        categoryId: vorstandssitzung?.id,
        date: new Date('2026-09-08T19:00:00'),
        title: '1. Vorstandssitzung',
        description: 'Erste Vorstandssitzung des neuen Lionsjahres.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: clubabend?.id,
        date: new Date('2026-09-24T19:00:00'),
        title: 'Vortrag: Vom Wert des Glücks',
        description: 'Interessanter Vortrag zum Thema Glück und Zufriedenheit.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },

      // OKTOBER 2026
      {
        categoryId: mitgliederversammlung?.id,
        date: new Date('2026-10-06T19:00:00'),
        title: '1. Mitgliederversammlung (Entlastung Vorstand)',
        description: 'Erste Mitgliederversammlung mit Entlastung des Vorstands.\n\nOrt: Altes Rathaus\n\nAnwesenheit aller Mitglieder erforderlich!',
        status: 'CONFIRMED' as const,
        isMandatory: true,
      },
      {
        categoryId: sonstiges?.id,
        date: new Date('2026-10-17T18:00:00'),
        title: 'Charterfeier',
        description: 'Feierliche Charterfeier unseres Clubs.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: activity?.id,
        date: new Date('2026-10-28T14:00:00'),
        title: 'Seniorenaktivität',
        description: 'Activity für Senioren in unserer Gemeinde.\n\nOrt: noch unbekannt',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },

      // NOVEMBER 2026
      {
        categoryId: activity?.id,
        date: new Date('2026-11-11T19:00:00'),
        title: 'Krapfenaktion',
        description: 'Unsere beliebte Krapfenaktion zur Finanzierung sozialer Projekte.\n\nOrt: Art Di Como',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: clubabend?.id,
        date: new Date('2026-11-19T18:30:00'),
        title: 'Martini Gans Essen',
        description: 'Traditionelles Martini-Gans-Essen in festlicher Atmosphäre.\n\nOrt: Schloss Oedenberg',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: clubabend?.id,
        date: new Date('2026-11-26T19:00:00'),
        title: 'Planungstreffen Lionsjahr 2027/2028',
        description: 'Gemeinsame Planung für das kommende Lionsjahr.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },

      // DEZEMBER 2026
      {
        categoryId: clubabend?.id,
        date: new Date('2026-12-02T18:00:00'),
        title: 'Besuch Weihnachtsmarkt',
        description: 'Gemeinsamer Besuch des Weihnachtsmarkts.\n\nOrt: Laufer Weihnachtsmarkt',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: sonstiges?.id,
        date: new Date('2026-12-18T19:00:00'),
        title: 'Weihnachtsfeier',
        description: 'Festliche Weihnachtsfeier mit allen Mitgliedern und Partnern.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: activity?.id,
        date: new Date('2026-12-21T14:00:00'),
        title: 'Weihnachtsbescherung für Senioren',
        description: 'Besondere Weihnachtsaktion für Senioren in unserer Region.\n\nOrt: noch unbekannt',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },

      // JANUAR 2027
      {
        categoryId: activity?.id,
        date: new Date('2027-01-06T15:00:00'),
        title: 'Heilige 3 Könige Wanderung',
        description: 'Traditionelle Wanderung zum Dreikönigstag.\n\nOrt: Kapellenhof Pottenstein',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: clubabend?.id,
        date: new Date('2027-01-21T19:00:00'),
        title: 'Besuch District Governor',
        description: 'Offizieller Besuch des District Governors.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },

      // FEBRUAR 2027
      {
        categoryId: activity?.id,
        date: new Date('2027-02-02T19:00:00'),
        title: 'Führung EMUGE',
        description: 'Betriebsbesichtigung bei der Firma EMUGE.\n\nOrt: EMUGE Lauf',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: clubabend?.id,
        date: new Date('2027-02-18T19:00:00'),
        title: 'Vortrag: Künstliche Intelligenz',
        description: 'Spannender Vortrag über künstliche Intelligenz und ihre Auswirkungen.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },

      // MÄRZ 2027
      {
        categoryId: clubabend?.id,
        date: new Date('2027-03-09T19:00:00'),
        title: 'Vortrag: Siebenbürgen',
        description: 'Informativer Vortrag über die Region Siebenbürgen.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: vorstandssitzung?.id,
        date: new Date('2027-03-11T19:00:00'),
        title: '2. Vorstandssitzung',
        description: 'Zweite Vorstandssitzung des Lionsjahres.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: mitgliederversammlung?.id,
        date: new Date('2027-03-25T19:00:00'),
        title: '2. Mitgliederversammlung (Neuwahlen)',
        description: 'Zweite Mitgliederversammlung mit Neuwahlen des Vorstands.\n\nOrt: Altes Rathaus\n\nAnwesenheit aller Mitglieder erforderlich!',
        status: 'CONFIRMED' as const,
        isMandatory: true,
      },

      // APRIL 2027
      {
        categoryId: activity?.id,
        date: new Date('2027-04-03T09:00:00'),
        title: 'Besuch LLA Triesdorf',
        description: 'Tagesausflug zur Landwirtschaftlichen Lehranstalt Triesdorf.\n\nOrt: Triesdorf',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: clubabend?.id,
        date: new Date('2027-04-15T19:00:00'),
        title: 'Clubabend',
        description: 'Regulärer Clubabend.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },

      // MAI 2027
      {
        categoryId: sonstiges?.id,
        date: new Date('2027-05-01T08:00:00'),
        endDate: new Date('2027-05-02T18:00:00'),
        title: 'Jumelage in Italien',
        description: 'Besuch bei unserem Partnerclub in Italien.\n\nOrt: Italien',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: activity?.id,
        date: new Date('2027-05-08T09:00:00'),
        title: 'Mehrgenerationenlauf',
        description: 'Teilnahme am Mehrgenerationenlauf zur Förderung des Sports.\n\nOrt: Lauf a.d. Pegnitz',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: clubabend?.id,
        date: new Date('2027-05-20T19:00:00'),
        title: '1. Vorbereitungsabend Altstadtfest',
        description: 'Erste Planungssitzung für unser Altstadtfest.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },

      // JUNI 2027
      {
        categoryId: clubabend?.id,
        date: new Date('2027-06-03T19:00:00'),
        title: '2. Vorbereitungsabend Altstadtfest',
        description: 'Zweite Planungssitzung für das Altstadtfest - finale Abstimmungen.\n\nOrt: Altes Rathaus',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: activity?.id,
        date: new Date('2027-06-23T16:00:00'),
        title: 'Aufbau Altstadtfest (Tag 1)',
        description: 'Erster Aufbautag für das Altstadtfest.\n\nOrt: Spitalshof',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: activity?.id,
        date: new Date('2027-06-24T16:00:00'),
        title: 'Aufbau Altstadtfest (Tag 2)',
        description: 'Zweiter Aufbautag für das Altstadtfest.\n\nOrt: Spitalshof',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: activity?.id,
        date: new Date('2027-06-25T16:00:00'),
        endDate: new Date('2027-06-27T23:00:00'),
        title: 'Altstadtfest',
        description: 'Unser großes Altstadtfest - das Highlight des Jahres!\n\nOrt: Spitalshof\n\n3 Tage mit Musik, Essen und Unterhaltung.',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
      {
        categoryId: activity?.id,
        date: new Date('2027-06-28T10:00:00'),
        title: 'Abbau Altstadtfest',
        description: 'Abbau und Aufräumen nach dem Altstadtfest.\n\nOrt: Spitalshof',
        status: 'CONFIRMED' as const,
        isMandatory: false,
      },
    ];

    // Filter events with valid categoryId and create them
    const validEvents = plannedEventsData.filter((event) => event.categoryId);

    await prisma.plannedEvent.createMany({
      data: validEvents.map((event) => ({
        lionsYearId: lionsYear2627.id,
        categoryId: event.categoryId!,
        date: event.date,
        endDate: event.endDate || null,
        title: event.title,
        description: event.description,
        status: event.status,
        isMandatory: event.isMandatory,
      })),
    });

    plannedEventsCount = validEvents.length;
    console.log(`✅ Created ${plannedEventsCount} planned events for Lions Year 2026/2027`);
  } // End of shouldCreateEvents block

  // 10. Seed Permissions and Roles
  console.log('\n🔐 Setting up permissions and roles...');
  await seedPermissions();
  await createRolesForTenant(tenant.id);

  // Count created roles and permissions
  const rolesCount = await prisma.role.count({ where: { tenantId: tenant.id } });
  const permissionsCount = await prisma.permission.count();

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   • 1 Tenant: ${tenant.name}`);
  console.log(`   • ${createdActivityTypes.length} Activity Types`);
  console.log(`   • ${createdMembers.length} Members`);
  console.log('   • 4 Events');
  console.log('   • 3 Event Registrations');
  console.log(`   • ${createdCategories.length} Event Categories`);
  console.log(`   • ${createdRules.length} Recurring Rules`);
  console.log(`   • ${createdTemplates.length} Event Templates`);
  console.log(`   • 1 Lions Year (2026/2027)`);
  console.log(`   • ${plannedEventsCount} Planned Events`);
  console.log(`   • ${permissionsCount} Permissions`);
  console.log(`   • ${rolesCount} Roles`);
  console.log(
    '\n⚠️  Remember to configure Supabase Auth and update authUserId values!'
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
