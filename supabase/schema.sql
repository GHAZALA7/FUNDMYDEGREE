-- FundMyDegree Database Schema
-- Run this in your Supabase SQL editor to set up the database.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Scholarships table
create table if not exists public.scholarships (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  provider            text not null,
  university          text,
  description         text not null default '',
  eligibility_criteria text[] not null default '{}',
  deadline            date,
  deadline_display    text,
  amount              text,
  url                 text not null unique,
  source_domain       text not null,
  levels              text[] not null default '{}',
  categories          text[] not null default '{}',
  province            text,
  is_ra_ta            boolean not null default false,
  page_last_updated   text,
  last_scraped_at     timestamptz not null default now(),
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

-- Indexes for fast filtering
create index if not exists idx_scholarships_is_active on public.scholarships (is_active);
create index if not exists idx_scholarships_deadline  on public.scholarships (deadline);
create index if not exists idx_scholarships_levels    on public.scholarships using gin (levels);
create index if not exists idx_scholarships_categories on public.scholarships using gin (categories);

-- Row Level Security: public read, no public write
alter table public.scholarships enable row level security;

create policy "Allow public read"
  on public.scholarships for select
  using (true);

-- Scraper log table (tracks each scraping run)
create table if not exists public.scrape_logs (
  id          uuid primary key default uuid_generate_v4(),
  run_at      timestamptz not null default now(),
  source      text not null,
  added       int not null default 0,
  updated     int not null default 0,
  removed     int not null default 0,
  errors      text[] not null default '{}',
  duration_s  numeric
);

alter table public.scrape_logs enable row level security;

create policy "Allow public read logs"
  on public.scrape_logs for select
  using (true);
