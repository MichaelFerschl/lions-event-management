import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY nicht gesetzt - Emails werden nicht versendet');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Absender-Email (für Development: onboarding@resend.dev)
// Für Produktion: Eigene Domain verifizieren
export const FROM_EMAIL = process.env.FROM_EMAIL || 'Lions Hub <onboarding@resend.dev>';
