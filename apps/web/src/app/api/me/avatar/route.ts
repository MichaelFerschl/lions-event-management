import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const BUCKET_NAME = 'avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename with random UUID for security
    // This prevents URL guessing even if bucket is public
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueId = randomUUID();
    const fileName = `${member.tenantId}/${member.id}-${uniqueId}.${fileExt}`;

    // Delete old avatar if exists
    if (member.avatarUrl) {
      const oldPath = member.avatarUrl.split(`${BUCKET_NAME}/`)[1];
      if (oldPath) {
        await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
      }
    }

    // Upload new avatar
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    // Update member with new avatar URL
    await db.member.update({
      where: { id: member.id },
      data: { avatarUrl },
    });

    return NextResponse.json({
      success: true,
      avatarUrl,
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
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

    if (!member.avatarUrl) {
      return NextResponse.json({ error: 'No avatar to delete' }, { status: 400 });
    }

    // Delete from storage
    const oldPath = member.avatarUrl.split(`${BUCKET_NAME}/`)[1];
    if (oldPath) {
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([oldPath]);

      if (deleteError) {
        console.error('Delete error:', deleteError);
      }
    }

    // Clear avatar URL in database
    await db.member.update({
      where: { id: member.id },
      data: { avatarUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
