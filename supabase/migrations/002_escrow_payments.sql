-- Freebuff Marketplace — Escrow & Milestone Payments
-- Adds escrow milestones and a ledger of transactions.
-- Money never moves in Postgres; these tables track state that a payment
-- provider (mock today, Stripe later) reconciles against.

-- ---------------------------------------------------------------------------
-- Escrow milestones (one row per accepted-bid milestone)
-- ---------------------------------------------------------------------------

create table public.escrow_milestones (
  id uuid primary key default uuid_generate_v4(),
  bid_id uuid references public.bids(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  amount numeric(12, 2) not null check (amount > 0),
  -- Platform commission on release, in basis points (500 = 5%)
  platform_fee_bps integer not null default 500 check (platform_fee_bps between 0 and 5000),
  status text not null default 'pending_funding' check (status in (
    'pending_funding', 'funded', 'work_submitted', 'approved', 'released', 'disputed'
  )),
  funded_at timestamptz,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Transaction ledger (audit trail of every escrow movement)
-- ---------------------------------------------------------------------------

create table public.escrow_transactions (
  id uuid primary key default uuid_generate_v4(),
  milestone_id uuid references public.escrow_milestones(id) on delete cascade not null,
  -- Client profile for fund/dispute, freelancer profile for release/payout
  profile_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('escrow_fund', 'escrow_release', 'escrow_refund', 'platform_fee')),
  amount numeric(12, 2) not null check (amount > 0),
  provider text not null default 'mock' check (provider in ('mock', 'stripe')),
  provider_ref text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index idx_escrow_milestones_bid_id on public.escrow_milestones(bid_id);
create index idx_escrow_milestones_project_id on public.escrow_milestones(project_id);
create index idx_escrow_milestones_status on public.escrow_milestones(project_id, status);
create index idx_escrow_tx_milestone_id on public.escrow_transactions(milestone_id);
create index idx_escrow_tx_profile_id on public.escrow_transactions(profile_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.escrow_milestones enable row level security;
alter table public.escrow_transactions enable row level security;

-- Milestones visible to the project's client and the bid's freelancer
create policy "Escrow milestones visible to project parties"
  on public.escrow_milestones for select
  using (
    project_id in (
      select p.id from public.projects p
      join public.profiles pr on pr.id = p.client_id
      where pr.user_id = auth.uid()
    )
    or bid_id in (
      select b.id from public.bids b
      join public.profiles pr on pr.id = b.freelancer_id
      where pr.user_id = auth.uid()
    )
  );

-- Only the project's client can create milestones (from an accepted bid)
create policy "Project client can create milestones"
  on public.escrow_milestones for insert
  with check (
    project_id in (
      select p.id from public.projects p
      join public.profiles pr on pr.id = p.client_id
      where pr.user_id = auth.uid() and pr.role = 'client'
    )
  );

-- Status transitions allowed for the two parties (fund/approve/release by
-- client, submit by freelancer). Server-side code should perform these via
-- SECURITY DEFINER functions in production; policies are the safety net.
create policy "Escrow parties can update milestones"
  on public.escrow_milestones for update
  using (
    project_id in (
      select p.id from public.projects p
      join public.profiles pr on pr.id = p.client_id
      where pr.user_id = auth.uid()
    )
    or bid_id in (
      select b.id from public.bids b
      join public.profiles pr on pr.id = b.freelancer_id
      where pr.user_id = auth.uid()
    )
  );

-- Transactions visible to milestone parties; inserts by authenticated parties
-- (real money movement happens in the payment provider, not here)
create policy "Escrow transactions visible to milestone parties"
  on public.escrow_transactions for select
  using (
    milestone_id in (
      select m.id from public.escrow_milestones m
      where m.project_id in (
        select p.id from public.projects p
        join public.profiles pr on pr.id = p.client_id
        where pr.user_id = auth.uid()
      )
      or m.bid_id in (
        select b.id from public.bids b
        join public.profiles pr on pr.id = b.freelancer_id
        where pr.user_id = auth.uid()
      )
    )
  );

create policy "Escrow parties can record transactions"
  on public.escrow_transactions for insert
  with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create trigger update_escrow_milestones_updated_at
  before update on public.escrow_milestones
  for each row execute function public.update_updated_at();
