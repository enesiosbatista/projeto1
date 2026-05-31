-- =====================================================================
-- VIRALMIND AI — DATABASE SCHEMA & SECURITY POLICIES
-- Paste this script into the "SQL Editor" of your Supabase Dashboard
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Create Profiles Table (extends auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  plan text default 'free',
  credits integer default 5,
  niche text,
  platforms text[],
  goals text[],
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- Profiles RLS Policies
create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (auth.jwt() ->> 'email' = 'enesiobahia@gmail.com' or auth.jwt() ->> 'email' = 'enesiosbatista@gmail.com' or (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

create policy "Admins can update all profiles"
  on public.profiles for update
  using (auth.jwt() ->> 'email' = 'enesiobahia@gmail.com' or auth.jwt() ->> 'email' = 'enesiosbatista@gmail.com' or (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

-- ---------------------------------------------------------------------
-- 2. Create Analyses Table
-- ---------------------------------------------------------------------
create table if not exists public.analyses (
  id text primary key,
  user_id uuid references public.profiles on delete cascade not null,
  url text not null,
  platform text not null,
  title text not null,
  thumbnail_url text,
  duration_seconds integer not null,
  viral_score integer not null,
  status text not null,
  is_favorited boolean default false,
  result jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Analyses
alter table public.analyses enable row level security;

-- Analyses RLS Policies
create policy "Users can view their own analyses" 
  on public.analyses for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own analyses" 
  on public.analyses for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own analyses" 
  on public.analyses for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own analyses" 
  on public.analyses for delete 
  using (auth.uid() = user_id);

create policy "Admins can view all analyses"
  on public.analyses for select
  using (auth.jwt() ->> 'email' = 'enesiobahia@gmail.com' or auth.jwt() ->> 'email' = 'enesiosbatista@gmail.com' or (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

create policy "Admins can manage all analyses"
  on public.analyses for all
  using (auth.jwt() ->> 'email' = 'enesiobahia@gmail.com' or auth.jwt() ->> 'email' = 'enesiosbatista@gmail.com' or (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

-- ---------------------------------------------------------------------
-- 3. Create Recreations Table
-- ---------------------------------------------------------------------
create table if not exists public.recreations (
  id uuid primary key default gen_random_uuid(),
  analysis_id text references public.analyses on delete cascade not null,
  style text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Recreations
alter table public.recreations enable row level security;

-- Recreations RLS Policies
create policy "Users can view recreations of their own analyses" 
  on public.recreations for select 
  using (
    exists (
      select 1 from public.analyses a 
      where a.id = recreations.analysis_id and a.user_id = auth.uid()
    )
  );

create policy "Users can insert recreations for their own analyses" 
  on public.recreations for insert 
  with check (
    exists (
      select 1 from public.analyses a 
      where a.id = recreations.analysis_id and a.user_id = auth.uid()
    )
  );

create policy "Admins can view all recreations"
  on public.recreations for select
  using (auth.jwt() ->> 'email' = 'enesiobahia@gmail.com' or auth.jwt() ->> 'email' = 'enesiosbatista@gmail.com' or (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

create policy "Admins can manage all recreations"
  on public.recreations for all
  using (auth.jwt() ->> 'email' = 'enesiobahia@gmail.com' or auth.jwt() ->> 'email' = 'enesiosbatista@gmail.com' or (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin');

-- ---------------------------------------------------------------------
-- 4. Automatic Profile Trigger on Auth Signup
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  platforms_arr text[];
  goals_arr text[];
begin
  -- Safely extract platforms array from auth metadata
  begin
    platforms_arr := array(select jsonb_array_elements_text(coalesce(new.raw_user_meta_data->'platforms', '[]'::jsonb)));
  exception when others then
    platforms_arr := '{}'::text[];
  end;

  -- Safely extract goals array from auth metadata
  begin
    goals_arr := array(select jsonb_array_elements_text(coalesce(new.raw_user_meta_data->'goals', '[]'::jsonb)));
  exception when others then
    goals_arr := '{}'::text[];
  end;

  -- Insert profile record
  insert into public.profiles (id, username, plan, credits, niche, platforms, goals)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'free',
    5,
    new.raw_user_meta_data->>'niche',
    platforms_arr,
    goals_arr
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
