# Fiper Live Formations

Arabic-first course publishing, registration, communication, and attendance platform for Fiper Academy.

## What is implemented

- Premium responsive Arabic course landing page
- Confirmed and automatic-waitlist completion states
- Validated registration API with preview mode
- Atomic PostgreSQL capacity allocation and duplicate prevention
- Course operations dashboard
- Multi-tab course editor
- Registration, attendance, communication, report, and settings workspaces
- Admin/User database authorization model
- Callbell WhatsApp adapter and delivery-status webhook
- Supabase migrations and reproducible staging seed
- Vercel-ready security and cache headers

## Local development

Requirements: Node.js 20.9 or newer.

~~~bash
npm install
copy .env.example .env.local
npm run dev
~~~

Open:

- Public page: http://localhost:3000
- Dashboard: http://localhost:3000/admin
- Course editor: http://localhost:3000/admin/courses/crs_forex_001
- Confirmation preview: http://localhost:3000/confirmation?status=confirmed&name=سارة
- Waitlist preview: http://localhost:3000/confirmation?status=waitlisted&name=سارة

The registration endpoint operates in safe preview mode when Supabase credentials are absent. Preview mode validates the request and demonstrates the complete user journey without storing customer data or sending messages.

## Database

The Supabase files are:

- supabase/migrations/001_core_schema.sql
- supabase/migrations/002_registration_rpc_and_security.sql
- supabase/seed.sql

The registration RPC locks the active course session transactionally, checks email and phone duplicates, assigns confirmed/waitlisted status, creates the registration, and emits an outbox event in one transaction.

For a local Supabase environment:

~~~bash
supabase start
supabase db reset
~~~

## Callbell

The server-only Callbell adapter is in src/lib/integrations/callbell.ts.

Required values:

- CALLBELL_API_KEY
- CALLBELL_CHANNEL_UUID
- CALLBELL_WEBHOOK_SECRET
- One UUID for each approved WhatsApp template

Configure Callbell to send message_status_updated events to:

~~~text
https://YOUR_DEPLOYMENT/api/webhooks/callbell
~~~

Include the configured shared secret as the x-fiper-webhook-secret header. Provider payloads are stored for operational diagnosis but never exposed to the public client.

## Deployment

1. Push the repository to GitHub.
2. Create separate Supabase staging and production projects.
3. Apply migrations and seed only the staging environment.
4. Import the GitHub repository into Vercel.
5. Add environment variables separately for Preview and Production.
6. Test registration, duplicate handling, waitlist capacity, Callbell delivery webhooks, and Google attendance reconciliation.
7. Connect the final Fiper subdomain after production approval.

## Security notes

- Service-role and provider credentials are server-only.
- Public registration writes go through a validated server endpoint and atomic RPC.
- The database uses grants plus Row-Level Security.
- Users can manage course operations but cannot delete core records, export data, manage users, or alter integrations.
- Admins have complete operational access.
- Admin pages are no-index and no-store.
- A strict nonce-based Content Security Policy should be enabled when authentication and final analytics providers are connected.

## Remaining credential-dependent work

- Provision the first Supabase Auth user, promote its profile role to admin, and enroll MFA
- Company Google Workspace OAuth and Calendar/Meet creation
- Approved Callbell template UUID mapping
- Transactional email provider and sender-domain verification
- Durable reminder worker and production monitoring

These boundaries are already represented in the schema and application configuration; no redesign is required when credentials become available.

The dashboard is protected by Supabase SSR authentication unless ADMIN_PREVIEW_MODE=true is explicitly configured. Never enable preview mode on the production domain.
