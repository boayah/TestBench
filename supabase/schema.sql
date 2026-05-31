-- TestBench Tracker - Supabase Schema
-- Run this in the Supabase SQL editor to initialize the database.

create extension if not exists "pgcrypto";

-- Protocols
create table if not exists protocols (
  id text primary key,
  name text not null,
  revision text not null,
  owner text not null,
  equipment_required text[] not null default '{}',
  fixture_required text not null default '',
  acceptance_criteria jsonb not null default '[]',
  status text not null check (status in ('draft', 'active', 'archived')) default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fixtures
create table if not exists fixtures (
  id text primary key,
  name text not null,
  type text not null,
  location text not null default '',
  status text not null check (status in ('active', 'inactive', 'under_maintenance', 'retired')) default 'active',
  last_check_date date,
  next_check_date date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Test runs
create table if not exists test_runs (
  id text primary key,
  protocol_id text not null references protocols(id),
  protocol_revision text not null,
  unit_id text not null,
  operator text not null,
  fixture_id text not null references fixtures(id),
  date date not null,
  measurements jsonb not null default '[]',
  result text not null check (result in ('pass', 'fail', 'needs_review')) default 'needs_review',
  observations text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Failures
create table if not exists failures (
  id text primary key,
  test_run_id text not null references test_runs(id),
  failure_mode text not null,
  severity text not null check (severity in ('critical', 'major', 'minor')),
  suspected_cause text not null default '',
  disposition text not null check (disposition in ('scrap', 'rework', 'use_as_is', 'pending')) default 'pending',
  corrective_action text not null default '',
  owner text not null,
  status text not null check (status in ('open', 'in_progress', 'closed', 'cancelled')) default 'open',
  opened_date date not null,
  closed_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated_at triggers
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger protocols_updated_at before update on protocols
  for each row execute function set_updated_at();
create trigger fixtures_updated_at before update on fixtures
  for each row execute function set_updated_at();
create trigger test_runs_updated_at before update on test_runs
  for each row execute function set_updated_at();
create trigger failures_updated_at before update on failures
  for each row execute function set_updated_at();

-- Row Level Security (enable for production)
-- alter table protocols enable row level security;
-- alter table fixtures enable row level security;
-- alter table test_runs enable row level security;
-- alter table failures enable row level security;
