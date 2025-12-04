'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { MemberRole, MemberStatus } from '@prisma/client';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export async function registerClub(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    // Form-Daten extrahieren
    const clubName = formData.get('clubName') as string;
    const clubNumber = formData.get('clubNumber') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;

    // Validierung
    if (
      !clubName ||
      !clubNumber ||
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      return { error: 'Bitte füllen Sie alle Pflichtfelder aus.' };
    }

    if (!/^[0-9]{6}$/.test(clubNumber)) {
      return { error: 'Die Club-Nummer muss 6 Ziffern haben.' };
    }

    if (password !== passwordConfirm) {
      return { error: 'Die Passwörter stimmen nicht überein.' };
    }

    if (password.length < 8) {
      return { error: 'Das Passwort muss mindestens 8 Zeichen haben.' };
    }

    // Prüfen ob Club-Nummer bereits existiert
    const existingTenant = await db.tenant.findUnique({
      where: { clubNumber },
    });

    if (existingTenant) {
      return { error: 'Ein Club mit dieser Club-Nummer ist bereits registriert.' };
    }

    // Prüfen ob E-Mail bereits existiert
    const existingMember = await db.member.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existingMember) {
      return { error: 'Diese E-Mail-Adresse ist bereits registriert.' };
    }

    // Slug generieren und Eindeutigkeit sicherstellen
    let slug = generateSlug(clubName);
    const existingSlug = await db.tenant.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${clubNumber}`;
    }

    // Supabase Auth User erstellen
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (authError || !authData.user) {
      console.error('Auth error:', authError);
      return { error: authError?.message || 'Fehler bei der Registrierung.' };
    }

    // Datenbank-Transaktion: Tenant, Roles, Member erstellen
    await db.$transaction(async (tx) => {
      // 1. Tenant erstellen
      const tenant = await tx.tenant.create({
        data: {
          name: clubName,
          slug,
          clubNumber,
          settings: {},
          features: ['events', 'planning', 'website'],
        },
      });

      // 2. Standard-Rollen für den Tenant erstellen
      const adminRole = await tx.role.create({
        data: {
          name: 'Administrator',
          type: 'ADMIN',
          tenantId: tenant.id,
          isSystem: true,
        },
      });

      await tx.role.create({
        data: {
          name: 'Vorstand',
          type: 'BOARD',
          tenantId: tenant.id,
          isSystem: true,
        },
      });

      await tx.role.create({
        data: {
          name: 'Mitglied',
          type: 'MEMBER',
          tenantId: tenant.id,
          isSystem: true,
        },
      });

      // 3. Admin-Member erstellen
      await tx.member.create({
        data: {
          tenantId: tenant.id,
          authUserId: authData.user!.id,
          email: email.toLowerCase(),
          firstName,
          lastName,
          role: MemberRole.ADMIN,
          status: MemberStatus.ACTIVE,
          roleId: adminRole.id,
          isActive: true,
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      error:
        'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    };
  }
}
