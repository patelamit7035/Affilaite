# FunnelOS Affiliate MVP

Small affiliate/referral app built with Next.js + Supabase.

## Included

- User sign up and login with email + password
- Automatic affiliate profile and unique affiliate code
- One FunnelOS product shown after login
- Shareable referral link: `/?ref=AFFILIATE_CODE`
- Public lead form connected to the affiliate code
- Lead data stored in Supabase Postgres
- User dashboard with clicks/leads
- Admin dashboard with all registered users and all leads
- Supabase Auth + Row Level Security
- Ready for Vercel deployment from GitHub

## Connected Supabase project

Project ref: `xilhjacybwljxctpugqw`

Project URL: `https://xilhjacybwljxctpugqw.supabase.co`

The frontend uses the Supabase publishable key only. Never add a Supabase secret/service-role key to browser code.

Database tables used by this MVP:

- `fos_profiles`
- `fos_leads`
- `fos_clicks`
- `fos_settings`

Main RPC functions:

- `fos_register_lead`
- `fos_affiliate_stats`
- `fos_affiliate_leads`
- `fos_claim_owner_admin`

## Admin

The configured project-owner email can log in and click **Make Me Admin** once. The database function verifies the signed-in email before granting the admin role.

## Vercel

This repository is a standard Next.js project. If this GitHub repository is already connected to a Vercel project, every push to `main` will trigger a new Vercel deployment automatically.

If it is not yet imported:

1. In Vercel click **Add New > Project**.
2. Import `patelamit7035/Affilaite`.
3. Keep Framework Preset as **Next.js**.
4. Deploy.

The app does not require a Supabase service-role secret in Vercel for this MVP.

## Test flow

1. Open the deployed app.
2. Create an account with email + password.
3. Log in.
4. Copy the affiliate/referral link.
5. Open the referral link in a private/incognito window.
6. Submit a test lead.
7. Return to the dashboard and confirm the lead appears.
8. The owner account can activate admin access and view all users/leads.

## Production notes

- Keep Row Level Security enabled.
- Add CAPTCHA/rate limiting before sending high-volume paid traffic.
- Configure Supabase Auth email settings for your production domain.
- Never expose secret/service-role keys in GitHub or frontend code.
