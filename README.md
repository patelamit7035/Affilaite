# FunnelOS Affiliate MVP

Small affiliate/referral app built with Next.js + Supabase.

## Included

- User sign up and login
- Automatic affiliate profile and unique affiliate code
- One FunnelOS product shown after login
- Shareable referral link: `/?ref=AFFILIATE_CODE`
- Public lead form connected to the affiliate code
- User dashboard with clicks/leads
- Admin dashboard with all registered users and all leads
- Supabase database and Auth
- Ready for Vercel deployment

## Supabase

This app is connected to the existing Supabase project `FunnelOS Affiliate`.

The frontend uses the public Supabase project URL and publishable key. Never add a Supabase service-role key to frontend code.

## Admin

The project-owner email can log in and click **Make Me Admin** once. The database function only permits the configured owner email to claim the admin role.

## Deploy on Vercel

1. Sign in to Vercel.
2. Click **Add New > Project**.
3. Import GitHub repository `patelamit7035/Affilaite`.
4. Framework should detect as **Next.js**.
5. No secret environment variables are required for this MVP because it uses the Supabase publishable key.
6. Click **Deploy**.

After deployment, log in, copy your referral link, open it in a private browser window, submit a test lead, then refresh the affiliate/admin dashboard.

## Important production notes

- Enable stronger password protection in Supabase Auth before wider public use.
- Add CAPTCHA/rate limiting to the public lead form if you run paid traffic.
- The current affiliate lead list intentionally uses the existing masked-data RPC. Admin sees full lead information.
