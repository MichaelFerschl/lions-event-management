import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    // Load current member with role
    const member = await db.member.findUnique({
      where: { authUserId: user.id },
      include: {
        tenant: { select: { name: true } },
        assignedRole: { select: { type: true, name: true } },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      avatarUrl: member.avatarUrl,
      role: member.assignedRole
        ? {
            type: member.assignedRole.type,
            name: member.assignedRole.name,
          }
        : null,
      tenantName: member.tenant.name,
    });
  } catch (error) {
    console.error('Error fetching current member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    // Load current member
    const member = await db.member.findUnique({
      where: { authUserId: user.id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, locale, emailNotifications } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }

    // Validate locale
    if (locale && !['de', 'en'].includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }

    // Update member
    const updatedMember = await db.member.update({
      where: { id: member.id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
        locale: locale || 'de',
        emailNotifications: emailNotifications ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      member: {
        id: updatedMember.id,
        firstName: updatedMember.firstName,
        lastName: updatedMember.lastName,
        phone: updatedMember.phone,
        locale: updatedMember.locale,
        emailNotifications: updatedMember.emailNotifications,
      },
    });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
