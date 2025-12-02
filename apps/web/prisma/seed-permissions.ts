import { PrismaClient, MemberRole } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  // Events
  {
    code: 'events.read',
    name: 'Events ansehen',
    category: 'events',
    description: 'Kann öffentliche Events sehen',
  },
  {
    code: 'events.read.all',
    name: 'Alle Events ansehen',
    category: 'events',
    description: 'Kann alle Events inkl. interner sehen',
  },
  {
    code: 'events.create',
    name: 'Events erstellen',
    category: 'events',
    description: 'Kann neue Events anlegen',
  },
  {
    code: 'events.edit',
    name: 'Events bearbeiten',
    category: 'events',
    description: 'Kann Events bearbeiten',
  },
  {
    code: 'events.delete',
    name: 'Events löschen',
    category: 'events',
    description: 'Kann Events löschen',
  },
  {
    code: 'events.register',
    name: 'Für Events anmelden',
    category: 'events',
    description: 'Kann sich für Events anmelden',
  },

  // Members
  {
    code: 'members.read',
    name: 'Mitglieder ansehen',
    category: 'members',
    description: 'Kann Mitgliederliste sehen (Basis)',
  },
  {
    code: 'members.read.full',
    name: 'Mitglieder Details',
    category: 'members',
    description: 'Kann alle Mitglieder-Details sehen',
  },
  {
    code: 'members.create',
    name: 'Mitglieder anlegen',
    category: 'members',
    description: 'Kann Mitglieder manuell anlegen',
  },
  {
    code: 'members.edit',
    name: 'Mitglieder bearbeiten',
    category: 'members',
    description: 'Kann Mitglieder bearbeiten',
  },
  {
    code: 'members.delete',
    name: 'Mitglieder löschen',
    category: 'members',
    description: 'Kann Mitglieder löschen',
  },
  {
    code: 'members.invite',
    name: 'Mitglieder einladen',
    category: 'members',
    description: 'Kann neue Mitglieder einladen',
  },

  // Planning
  {
    code: 'planning.read',
    name: 'Jahresplanung ansehen',
    category: 'planning',
    description: 'Kann Jahresplanung einsehen',
  },
  {
    code: 'planning.edit',
    name: 'Jahresplanung bearbeiten',
    category: 'planning',
    description: 'Kann Jahresplanung bearbeiten',
  },
  {
    code: 'planning.admin',
    name: 'Jahresplanung verwalten',
    category: 'planning',
    description: 'Kann Lions-Jahre anlegen/löschen',
  },

  // Website
  {
    code: 'website.read',
    name: 'Website ansehen',
    category: 'website',
    description: 'Kann Website-Einstellungen sehen',
  },
  {
    code: 'website.edit',
    name: 'Website bearbeiten',
    category: 'website',
    description: 'Kann Website-Inhalte bearbeiten',
  },

  // Settings
  {
    code: 'settings.read',
    name: 'Einstellungen ansehen',
    category: 'settings',
    description: 'Kann Club-Einstellungen sehen',
  },
  {
    code: 'settings.edit',
    name: 'Einstellungen bearbeiten',
    category: 'settings',
    description: 'Kann Club-Einstellungen ändern',
  },

  // Admin
  {
    code: 'admin.users',
    name: 'Benutzer verwalten',
    category: 'admin',
    description: 'Kann Benutzer und Rollen verwalten',
  },
  {
    code: 'admin.roles',
    name: 'Rollen verwalten',
    category: 'admin',
    description: 'Kann Rollen-Berechtigungen anpassen',
  },
  {
    code: 'admin.tenant',
    name: 'Club administrieren',
    category: 'admin',
    description: 'Volle Admin-Rechte',
  },
];

// Welche Permissions jede Rolle bekommt
const rolePermissions: Record<MemberRole, string[]> = {
  ADMIN: ['*'], // Alle Permissions
  PRESIDENT: [
    'events.*',
    'members.*',
    'planning.*',
    'website.*',
    'settings.*',
  ],
  SECRETARY: [
    'events.*',
    'members.*',
    'planning.*',
    'website.*',
    'settings.read',
  ],
  BOARD: [
    'events.*',
    'members.read',
    'members.read.full',
    'members.invite',
    'planning.read',
    'planning.edit',
    'website.read',
  ],
  MEMBER: [
    'events.read.all',
    'events.register',
    'members.read',
    'planning.read',
  ],
  GUEST: ['events.read', 'members.read'],
};

export async function seedPermissions() {
  console.log('🔐 Seeding permissions...');

  // Permissions erstellen
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: perm,
      create: perm,
    });
  }

  console.log(`✅ Created ${permissions.length} permissions`);
}

export async function createRolesForTenant(tenantId: string) {
  console.log(`👥 Creating roles for tenant ${tenantId}...`);

  const allPermissions = await prisma.permission.findMany();

  const roleConfigs: { type: MemberRole; name: string; description: string }[] = [
    {
      type: 'ADMIN',
      name: 'Administrator',
      description: 'Vollzugriff auf alle Funktionen',
    },
    {
      type: 'PRESIDENT',
      name: 'Präsident',
      description: 'Clubleitung mit erweiterten Rechten',
    },
    {
      type: 'SECRETARY',
      name: 'Sekretär',
      description: 'Verwaltung von Events und Mitgliedern',
    },
    {
      type: 'BOARD',
      name: 'Vorstand',
      description: 'Vorstandsmitglied mit erweiterten Rechten',
    },
    {
      type: 'MEMBER',
      name: 'Mitglied',
      description: 'Aktives Clubmitglied',
    },
    {
      type: 'GUEST',
      name: 'Gast',
      description: 'Eingeschränkter Zugriff',
    },
  ];

  for (const config of roleConfigs) {
    // Rolle erstellen oder aktualisieren
    const role = await prisma.role.upsert({
      where: { tenantId_type: { tenantId, type: config.type } },
      update: { name: config.name, description: config.description },
      create: {
        tenantId,
        type: config.type,
        name: config.name,
        description: config.description,
        isSystem: true,
      },
    });

    // Permissions zuweisen
    const permCodes = rolePermissions[config.type];

    if (permCodes.includes('*')) {
      // Alle Permissions
      for (const perm of allPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: role.id, permissionId: perm.id },
          },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    } else {
      // Spezifische Permissions (mit Wildcard-Support)
      for (const code of permCodes) {
        if (code.endsWith('.*')) {
          // Wildcard: z.B. "events.*" -> alle events.* Permissions
          const category = code.replace('.*', '');
          const matchingPerms = allPermissions.filter((p) =>
            p.code.startsWith(category + '.')
          );
          for (const perm of matchingPerms) {
            await prisma.rolePermission.upsert({
              where: {
                roleId_permissionId: { roleId: role.id, permissionId: perm.id },
              },
              update: {},
              create: { roleId: role.id, permissionId: perm.id },
            });
          }
        } else {
          // Exakte Permission
          const perm = allPermissions.find((p) => p.code === code);
          if (perm) {
            await prisma.rolePermission.upsert({
              where: {
                roleId_permissionId: { roleId: role.id, permissionId: perm.id },
              },
              update: {},
              create: { roleId: role.id, permissionId: perm.id },
            });
          }
        }
      }
    }

    console.log(`  ✅ Role "${config.name}" created with permissions`);
  }
}

// Standalone ausführen (nur wenn direkt aufgerufen)
async function main() {
  await seedPermissions();

  // Für bestehende Tenants Rollen erstellen
  const tenants = await prisma.tenant.findMany();
  for (const tenant of tenants) {
    await createRolesForTenant(tenant.id);
  }

  console.log('🎉 Permission seeding complete!');
}

// Nur ausführen wenn direkt aufgerufen, nicht beim Import
const isMainModule = require.main === module;
if (isMainModule) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
