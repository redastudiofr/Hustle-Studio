import {BRAND} from '~/config/brand';

/**
 * Sends a plain-text notification (review form, pop-up sign-ups) via Resend
 * to the shop's inbox. Returns whether it actually went out.
 *
 * Silent no-op when RESEND_API_KEY or the destination address is missing —
 * callers decide whether that is fine (a bonus copy) or means the submission
 * has nowhere else to go (the review form).
 *
 * Destination: NOTIFICATION_EMAIL (server-only env var), else BRAND.email.
 * Sent from Resend's sandbox address, which can only deliver to the e-mail
 * the Resend account was created with — see docs/PROMOTIONS.md.
 */
export async function sendNotificationEmail({
  env,
  subject,
  text,
}: {
  env: Env;
  subject: string;
  text: string;
}): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  const to = env.NOTIFICATION_EMAIL || BRAND.email;
  if (!apiKey || !to) return false;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${BRAND.name} <onboarding@resend.dev>`,
        to: [to],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      console.error('Resend send failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Resend send failed', error);
    return false;
  }
}

/** Whether notifications can be sent at all (key and inbox configured). */
export function canSendNotifications(env: Env): boolean {
  return Boolean(env.RESEND_API_KEY && (env.NOTIFICATION_EMAIL || BRAND.email));
}
