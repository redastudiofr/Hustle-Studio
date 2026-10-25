# Drop waitlist ("BE FIRST.") and the -15% pop-up

The homepage waitlist (`app/components/home/WaitlistSection.tsx`, served by
`app/routes/waitlist.tsx`) asks for an e-mail and a phone number. Every
sign-up is e-mailed to **alexian.orh@gmail.com** (`LAUNCH.notifyEmail` in
`app/config/launch.ts`) through [Resend](https://resend.com).

The visitor is told "C'est noté" **only** once Resend has accepted the
e-mail. Until Resend is configured, the form answers "Les inscriptions ne
sont pas encore ouvertes" — it never pretends.

## Set-up (about 5 minutes)

1. Create a free account on https://resend.com **with the address
   alexian.orh@gmail.com**. Without a verified domain, Resend only delivers
   to the address the account was created with — that is why it must be
   this one.
2. Resend → API Keys → Create API key (permission "Sending access").
   Copy the key (`re_…`).
3. Vercel → project **hustle-studio** → Settings → Environment Variables →
   add `RESEND_API_KEY` = the key, environment **Production**. Save.
4. Redeploy (Vercel → Deployments → the latest one → Redeploy), so the
   function picks the variable up.
5. Test: sign up on the homepage with your own details. The e-mail
   "Liste d'attente — …" arrives at alexian.orh@gmail.com within seconds.

Optional: `NOTIFICATION_EMAIL` overrides the destination for every
notification (waitlist, reviews, pop-up). To send from your own domain
instead of `onboarding@resend.dev`, verify the domain in Resend.

## What each sign-up contains

E-mail, phone (normalised, e.g. `+33612345678`), e-mail marketing consent
(yes/no), SMS marketing consent (yes/no), drop date, sign-up time.

## Consent

Joining the waitlist only means "tell me when the drop launches". The two
boxes — offers by e-mail, offers by SMS — are optional and unticked by
default. A ticked e-mail box also adds the address to Shopify's e-mail
subscribers (Customers → "Email subscribers"); the SMS choice is recorded
in the e-mail only.

## Abuse protection

Honeypot field, minimum time on the form (2.5 s), same-origin check,
length limits, and a per-IP brake (5 attempts / 10 min per server
instance). For heavier protection, enable Vercel's Bot Protection
(Vercel → Firewall).

## Moving the launch date

`app/config/launch.ts` → `date`. The hero countdown reads it; at zero it
shows "Le drop est en ligne." and stops.

## Pop-up -15% on the first order

Built and translated (EN/FR), shown once per visitor after the language /
cookies dialog. It asks for a phone number and gives the code at once.
Each number is e-mailed to the same inbox through the same `RESEND_API_KEY`
(or stored in Notion if `NOTION_API_KEY` + `NOTION_PHONE_DATABASE_ID` are
set). The code is given only once the number is recorded.

It stays hidden until **both**:

1. **Resend is configured** (set-up above), and
2. **the discount exists in Shopify and its code is in the config.**
   Shopify Admin → Discounts → Create discount → *Amount off order*:
   - Code: `WELCOME15` (any name, write it down exactly)
   - Value: Percentage, `15`
   - Eligibility: *Specific customer segments* → "Customers who haven't
     purchased" (first order only)
   - Maximum uses: tick *Limit to one use per customer*
   - Active dates: from today, no end date
   Then put the same code in `app/config/promotions.ts` →
   `welcomePopup.code` (or ask Claude to), and redeploy.
