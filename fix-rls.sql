-- Run in Supabase SQL Editor. Fixes 403 "violates row-level security policy".
-- Allows INSERT for both anon AND authenticated (e.g. when you are logged in as admin in the same browser).
drop policy if exists "anon can insert visitor events" on public.visitor_events;
drop policy if exists "anon can insert visitor messages" on public.visitor_messages;
drop policy if exists "public can insert visitor events" on public.visitor_events;
drop policy if exists "public can insert visitor messages" on public.visitor_messages;

create policy "public can insert visitor events"
on public.visitor_events for insert to anon, authenticated with check (true);

create policy "public can insert visitor messages"
on public.visitor_messages for insert to anon, authenticated with check (true);

grant insert on public.visitor_events, public.visitor_messages to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
