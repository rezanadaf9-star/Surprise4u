-- Run this AFTER creating the admin user in Supabase Authentication.
-- Replace YOUR_ADMIN_EMAIL@example.com with the exact email used for your creator/admin login.
-- This allows ONLY that authenticated email to read analytics and messages.
-- Visitors still have INSERT-only access through the existing policies.

alter table public.visitor_events enable row level security;
alter table public.visitor_messages enable row level security;

drop policy if exists "admin can read visitor events" on public.visitor_events;
drop policy if exists "admin can read visitor messages" on public.visitor_messages;

create policy "admin can read visitor events"
on public.visitor_events
for select
to authenticated
using ((auth.jwt() ->> 'email') = 'nadaf4ndf@gmail.com');

create policy "admin can read visitor messages"
on public.visitor_messages
for select
to authenticated
using ((auth.jwt() ->> 'email') = 'nadaf4ndf@gmail.com');


-- Recipient names can be changed only by the same admin email.
drop policy if exists "admin can update surprise recipient names" on public.surprise_recipients;
create policy "admin can update surprise recipient names"
on public.surprise_recipients
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'nadaf4ndf@gmail.com')
with check ((auth.jwt() ->> 'email') = 'nadaf4ndf@gmail.com');
