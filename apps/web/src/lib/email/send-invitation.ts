import { resend, FROM_EMAIL } from './resend';
import { InvitationEmail } from './templates/invitation-email';

interface SendInvitationParams {
  to: string;
  inviteUrl: string;
  clubName: string;
  roleName: string;
  invitedByName: string;
  expiresInDays?: number;
}

export async function sendInvitationEmail({
  to,
  inviteUrl,
  clubName,
  roleName,
  invitedByName,
  expiresInDays = 7,
}: SendInvitationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Einladung zu ${clubName} auf Lions Hub`,
      react: InvitationEmail({
        inviteUrl,
        clubName,
        roleName,
        invitedByName,
        expiresInDays,
      }),
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Einladungs-Email gesendet an ${to} (ID: ${data?.id})`);
    return { success: true };
  } catch (err) {
    console.error('Email send exception:', err);
    return { success: false, error: 'Fehler beim Email-Versand' };
  }
}
