-- Freebuff Marketplace Database Schema
-- Run this migration to set up the initial database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  role text not null check (role in ('client', 'freelancer', 'admin')),
  full_name text not null,
  avatar_url text,
  bio text,
  location text,
  hourly_rate numeric(10, 2),
  skills text[] default '{}',
  availability text default 'available' check (availability in ('available', 'busy', 'unavailable')),
  social_links jsonb default '{}',
  completed_jobs integer default 0,
  total_earned numeric(12, 2) default 0,
  rating numeric(3, 2) default 0,
  review_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Companies table
create table public.companies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  logo_url text,
  description text,
  website text,
  verified boolean default false,
  team_members uuid[] default '{}',
  created_at timestamptz default now()
);

-- Projects table
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null,
  budget_min numeric(12, 2) not null,
  budget_max numeric(12, 2) not null,
  project_type text not null check (project_type in ('fixed', 'hourly')),
  status text not null default 'open' check (status in ('draft', 'open', 'in_progress', 'completed', 'cancelled')),
  experience_level text not null check (experience_level in ('entry', 'intermediate', 'expert')),
  skills text[] default '{}',
  deadline timestamptz,
  location text,
  attachments jsonb default '[]',
  visibility text default 'public' check (visibility in ('public', 'invite_only')),
  bid_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project sections (for rich content)
create table public.project_sections (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  content text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Bids / Proposals
create table public.bids (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  freelancer_id uuid references public.profiles(id) on delete cascade not null,
  price numeric(12, 2) not null,
  timeline_days integer not null,
  cover_letter text not null,
  milestones jsonb default '[]',
  attachments jsonb default '[]',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'shortlisted')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, freelancer_id)
);

-- Conversations
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  participants uuid[] not null,
  last_message_at timestamptz,
  created_at timestamptz default now()
);

-- Messages
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  type text default 'text' check (type in ('text', 'image', 'file')),
  file_url text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Notifications
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- Attachments
create table public.attachments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  url text not null,
  type text not null check (type in ('image', 'pdf', 'video', 'document')),
  size bigint not null,
  created_at timestamptz default now()
);

-- Reviews
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  reviewee_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamptz default now()
);

-- Saved projects
create table public.saved_projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, project_id)
);

-- Reports
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  target_type text not null check (target_type in ('user', 'project', 'message')),
  target_id uuid not null,
  reason text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz default now()
);

-- Indexes
create index idx_profiles_user_id on public.profiles(user_id);
create index idx_profiles_role on public.profiles(role);
create index idx_profiles_skills on public.profiles using gin(skills);
create index idx_projects_client_id on public.projects(client_id);
create index idx_projects_status on public.projects(status);
create index idx_projects_category on public.projects(category);
create index idx_projects_skills on public.projects using gin(skills);
create index idx_projects_budget on public.projects(budget_min, budget_max);
create index idx_bids_project_id on public.bids(project_id);
create index idx_bids_freelancer_id on public.bids(freelancer_id);
create index idx_messages_conversation_id on public.messages(conversation_id);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_read on public.notifications(user_id, read);
create index idx_reviews_reviewee_id on public.reviews(reviewee_id);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.bids enable row level security;
alter table public.messages enable row level security;
alter table public.conversations enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.saved_projects enable row level security;
alter table public.reports enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- Projects: public projects viewable by all, only owner can modify
create policy "Public projects are viewable"
  on public.projects for select
  using (visibility = 'public' or client_id in (
    select id from public.profiles where user_id = auth.uid()
  ));

create policy "Clients can create projects"
  on public.projects for insert
  with check (
    client_id in (
      select id from public.profiles where user_id = auth.uid() and role = 'client'
    )
  );

create policy "Clients can update own projects"
  on public.projects for update
  using (
    client_id in (
      select id from public.profiles where user_id = auth.uid()
    )
  );

-- Bids: only freelancer can create, client can view bids on their projects
create policy "Bids viewable by project owner and bidder"
  on public.bids for select
  using (
    freelancer_id in (select id from public.profiles where user_id = auth.uid())
    or project_id in (
      select id from public.projects where client_id in (
        select id from public.profiles where user_id = auth.uid()
      )
    )
  );

create policy "Freelancers can create bids"
  on public.bids for insert
  with check (
    freelancer_id in (
      select id from public.profiles where user_id = auth.uid() and role = 'freelancer'
    )
  );

-- Messages: only participants can view
create policy "Conversation participants can view messages"
  on public.messages for select
  using (
    conversation_id in (
      select id from public.conversations where auth.uid() = any(participants)
    )
  );

create policy "Participants can send messages"
  on public.messages for insert
  with check (
    sender_id in (select id from public.profiles where user_id = auth.uid())
    and conversation_id in (
      select id from public.conversations where auth.uid() = any(participants)
    )
  );

-- Conversations: only participants can view
create policy "Participants can view conversations"
  on public.conversations for select
  using (auth.uid() = any(participants));

-- Notifications: only owner can view
create policy "Users can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "System can create notifications"
  on public.notifications for insert
  with check (true);

-- Reviews: anyone can read, only reviewer can create
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Users can create reviews"
  on public.reviews for insert
  with check (
    reviewer_id in (select id from public.profiles where user_id = auth.uid())
  );

-- Saved projects: only owner can view and manage
create policy "Users can view own saved projects"
  on public.saved_projects for select
  using (user_id = auth.uid());

create policy "Users can save projects"
  on public.saved_projects for insert
  with check (user_id = auth.uid());

create policy "Users can unsave projects"
  on public.saved_projects for delete
  using (user_id = auth.uid());

-- Reports: only reporter can view own, admin can view all
create policy "Users can view own reports"
  on public.reports for select
  using (
    reporter_id in (select id from public.profiles where user_id = auth.uid())
    or exists (
      select 1 from public.profiles where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can create reports"
  on public.reports for insert
  with check (
    reporter_id in (select id from public.profiles where user_id = auth.uid())
  );

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'freelancer')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user profile creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger update_projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at();

create trigger update_bids_updated_at
  before update on public.bids
  for each row execute function public.update_updated_at();
