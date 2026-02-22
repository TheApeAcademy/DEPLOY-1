-- ================================================================
-- ApeAcademy — Complete Supabase Schema
-- Run this ONCE in Supabase → SQL Editor → New Query → Run
-- ================================================================

create extension if not exists "uuid-ossp";

-- ================================================================
-- PROFILES (linked to auth.users)
-- ================================================================
create table if not exists public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  name          text not null,
  email         text not null unique,
  role          text not null default 'user' check (role in ('user', 'admin')),
  region        text,
  country       text,
  school_level  text,
  department    text,
  created_at    timestamptz default now(),
  last_login    timestamptz
);

-- Auto-create profile on signup, auto-assign admin to your email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.email,
    case when new.email = 'j0shbankole19@gmail.com' then 'admin' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- ASSIGNMENTS
-- ================================================================
create table if not exists public.assignments (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references public.profiles(id) on delete cascade not null,
  user_name        text,
  user_email       text,
  assignment_type  text not null,
  course_name      text not null,
  class_name       text not null,
  teacher_name     text not null,
  due_date         text not null,
  platform         text not null,
  platform_contact text not null,
  description      text,
  files            jsonb default '[]',
  status           text not null default 'pending'
                   check (status in ('pending','analyzing','analyzed','paid','submitted','completed','rejected')),
  payment_amount   numeric(10,2),
  payment_id       uuid,
  complexity       text check (complexity in ('low','medium','high')),
  estimated_hours  integer,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ================================================================
-- PAYMENTS
-- ================================================================
create table if not exists public.payments (
  id                      uuid default uuid_generate_v4() primary key,
  assignment_id           uuid references public.assignments(id) on delete cascade not null,
  user_id                 uuid references public.profiles(id) on delete cascade not null,
  amount                  numeric(10,2) not null,
  currency                text not null default 'GBP',
  status                  text not null default 'pending'
                          check (status in ('pending','processing','completed','failed','refunded')),
  provider                text not null default 'wise',
  wise_pay_in_id          text,
  transaction_reference   text unique not null,
  provider_transaction_id text,
  metadata                jsonb,
  created_at              timestamptz default now(),
  completed_at            timestamptz
);

-- ================================================================
-- ACTIVITY LOGS
-- ================================================================
create table if not exists public.activity_logs (
  id            uuid default uuid_generate_v4() primary key,
  type          text not null,
  user_id       uuid references public.profiles(id) on delete set null,
  user_name     text,
  user_email    text,
  assignment_id uuid references public.assignments(id) on delete set null,
  payment_id    uuid references public.payments(id) on delete set null,
  description   text not null,
  timestamp     timestamptz default now()
);

-- ================================================================
-- PRICING RULES (you manage these from Supabase dashboard)
-- Edit rows here to change your prices — no code changes needed
-- ================================================================
create table if not exists public.pricing_rules (
  id              uuid default uuid_generate_v4() primary key,
  assignment_type text default 'default',  -- 'Essay', 'Thesis', 'default', etc.
  complexity      text not null check (complexity in ('low','medium','high')),
  hourly_rate     numeric(10,2) not null,   -- £ per hour
  description     text,
  created_at      timestamptz default now()
);

-- Default pricing — edit these in your Supabase dashboard anytime
insert into public.pricing_rules (assignment_type, complexity, hourly_rate, description) values
  ('default', 'low',    12.00, 'Standard low complexity — homework, short essays'),
  ('default', 'medium', 20.00, 'Standard medium complexity — projects, case studies'),
  ('default', 'high',   35.00, 'Standard high complexity — research papers, theses'),
  ('Homework',          'low',    8.00,  'Homework — low'),
  ('Essay',             'low',    10.00, 'Essay — low'),
  ('Essay',             'medium', 18.00, 'Essay — medium'),
  ('Essay',             'high',   28.00, 'Essay — high'),
  ('Research Paper',    'high',   40.00, 'Research paper — high complexity'),
  ('Thesis',            'high',   50.00, 'Thesis — highest tier'),
  ('Dissertation',      'high',   60.00, 'Dissertation — premium tier')
on conflict do nothing;

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
alter table public.profiles      enable row level security;
alter table public.assignments   enable row level security;
alter table public.payments      enable row level security;
alter table public.activity_logs enable row level security;
alter table public.pricing_rules enable row level security;

-- Profiles
create policy "Own profile read"    on public.profiles for select using (auth.uid() = id);
create policy "Own profile update"  on public.profiles for update using (auth.uid() = id);
create policy "Admin read all"      on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Assignments
create policy "User insert own"     on public.assignments for insert with check (auth.uid() = user_id);
create policy "User read own"       on public.assignments for select using (auth.uid() = user_id);
create policy "Admin read all"      on public.assignments for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin update all"    on public.assignments for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Payments
create policy "User insert own"     on public.payments for insert with check (auth.uid() = user_id);
create policy "User read own"       on public.payments for select using (auth.uid() = user_id);
create policy "Admin read all"      on public.payments for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin update all"    on public.payments for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Activity logs
create policy "Admin read logs"     on public.activity_logs for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Auth insert logs"    on public.activity_logs for insert with check (auth.uid() is not null);

-- Pricing rules (public read, admin write)
create policy "Anyone read pricing" on public.pricing_rules for select using (true);
create policy "Admin manage pricing" on public.pricing_rules for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ================================================================
-- PERFORMANCE INDEXES
-- ================================================================
create index if not exists idx_assignments_user_id   on public.assignments(user_id);
create index if not exists idx_assignments_status    on public.assignments(status);
create index if not exists idx_assignments_created   on public.assignments(created_at desc);
create index if not exists idx_payments_user_id      on public.payments(user_id);
create index if not exists idx_payments_status       on public.payments(status);
create index if not exists idx_payments_tx_ref       on public.payments(transaction_reference);
create index if not exists idx_logs_timestamp        on public.activity_logs(timestamp desc);
create index if not exists idx_logs_user_id          on public.activity_logs(user_id);
create index if not exists idx_pricing_complexity    on public.pricing_rules(complexity);
