// User & Auth Types
export type UserRole = "client" | "freelancer" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  hourly_rate: number | null;
  skills: string[];
  availability: "available" | "busy" | "unavailable";
  social_links: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  completed_jobs: number;
  total_earned: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  verified: boolean;
  team_members: string[];
  created_at: string;
}

// Project Types
export type ProjectStatus =
  | "draft"
  | "open"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ProjectType = "fixed" | "hourly";

export type ExperienceLevel = "entry" | "intermediate" | "expert";

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  project_type: ProjectType;
  status: ProjectStatus;
  experience_level: ExperienceLevel;
  skills: string[];
  deadline: string | null;
  location: string | null;
  attachments: Attachment[];
  visibility: "public" | "invite_only";
  bid_count: number;
  created_at: string;
  updated_at: string;
  client?: Profile;
}

export interface ProjectSection {
  id: string;
  project_id: string;
  title: string;
  content: string;
  order: number;
}

// Bid Types
export type BidStatus = "pending" | "accepted" | "rejected" | "shortlisted";

export interface Bid {
  id: string;
  project_id: string;
  freelancer_id: string;
  price: number;
  timeline_days: number;
  cover_letter: string;
  milestones: Milestone[];
  attachments: Attachment[];
  status: BidStatus;
  created_at: string;
  freelancer?: Profile;
  project?: Project;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  days: number;
}

// Messaging Types
export interface Conversation {
  id: string;
  participants: string[];
  last_message: Message | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: "text" | "image" | "file";
  file_url?: string;
  read: boolean;
  created_at: string;
  sender?: Profile;
}

// Notification Types
export type NotificationType =
  | "new_bid"
  | "bid_accepted"
  | "bid_rejected"
  | "message_received"
  | "project_updated"
  | "review_received"
  | "payment_received";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

// Attachment Types
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: "image" | "pdf" | "video" | "document";
  size: number;
}

// Review Types
export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  project_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Escrow & Payment Types
export type MilestoneStatus =
  | "pending_funding"
  | "funded"
  | "work_submitted"
  | "approved"
  | "released"
  | "disputed";

export type TransactionType =
  | "escrow_fund"
  | "escrow_release"
  | "escrow_refund"
  | "platform_fee";

export interface EscrowMilestone {
  id: string;
  bid_id: string;
  project_id: string;
  title: string;
  description: string | null;
  amount: number;
  /** Platform commission in basis points captured on release (e.g. 500 = 5%). */
  platform_fee_bps: number;
  status: MilestoneStatus;
  /** Set once the client funds this milestone into escrow. */
  funded_at: string | null;
  /** Set by the freelancer when the work for this milestone is delivered. */
  submitted_at: string | null;
  /** Set by the client on approval; funds release to the freelancer. */
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EscrowTransaction {
  id: string;
  milestone_id: string;
  /** Client profile id (money out) or freelancer profile id (money in), by transaction type. */
  profile_id: string;
  type: TransactionType;
  amount: number;
  /** Optional provider references (Stripe payment intent / transfer ids). */
  provider: "mock" | "stripe";
  provider_ref: string | null;
  created_at: string;
}

export interface EscrowSummary {
  total_funded: number;
  total_released: number;
  in_escrow: number;
  awaiting_approval: number;
  disputed_count: number;
}

// Dashboard Types
export interface ClientDashboardData {
  escrow_summary: EscrowSummary;
  funded_milestones: EscrowMilestone[];
  active_projects: Project[];
  new_bids: Bid[];
  shortlisted_freelancers: Profile[];
  unread_messages: number;
  total_spent: number;
  monthly_spending: { month: string; amount: number }[];
}

export interface FreelancerDashboardData {
  escrow_summary: EscrowSummary;
  payable_milestones: EscrowMilestone[];
  active_applications: Bid[];
  total_earnings: number;
  profile_views: number;
  invitations: number;
  unread_messages: number;
  monthly_earnings: { month: string; amount: number }[];
}

// Filter Types
export interface ProjectFilters {
  search: string;
  category: string[];
  budget_min: number | null;
  budget_max: number | null;
  project_type: ProjectType | null;
  experience_level: ExperienceLevel | null;
  location: string | null;
}
