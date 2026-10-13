/**
 * The next drop: its launch date, and where waitlist sign-ups go.
 *
 * To move the launch, change `date` and nothing else: the hero countdown
 * and the waitlist section both read it. Write it with its UTC offset
 * (+01:00 in winter, +02:00 in summer for Paris), so every visitor counts
 * down to the same instant whatever their own time zone.
 */
export const LAUNCH = {
  /** Friday 27 November 2026, 19:00, Paris time. */
  date: '2026-11-27T19:00:00+01:00',

  /**
   * Inbox that receives every waitlist sign-up (e-mail, phone, consents).
   * Sent through Resend: RESEND_API_KEY must be set in Vercel, see
   * docs/WAITLIST.md. NOTIFICATION_EMAIL, when set, takes precedence.
   */
  notifyEmail: 'alexian.orh@gmail.com',
};

/** The launch instant, in milliseconds since the epoch. */
export const LAUNCH_TIME = Date.parse(LAUNCH.date);
