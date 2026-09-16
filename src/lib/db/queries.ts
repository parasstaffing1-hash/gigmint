import "server-only";
import { query } from "@/lib/db/postgres";

// ---------------------------------------------------------------------------
// Read models for pages. All queries are parameterized. Numeric columns come
// back as strings from pg — callers format with formatCurrency etc.
// ---------------------------------------------------------------------------

export interface ProjectRow {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_min: string;
  budget_max: string;
  project_type: "fixed" | "hourly";
  status: "draft" | "open" | "in_progress" | "completed" | "cancelled";
  experience_level: "entry" | "intermediate" | "expert";
  skills: string[];
  deadline: string | null;
  location: string | null;
  bid_count: number;
  created_at: string;
  client_name: string;
  client_verified: boolean;
}

const PROJECT_SELECT = `
  select p.id, p.title, p.description, p.category, p.budget_min, p.budget_max,
         p.project_type, p.status, p.experience_level, p.skills, p.deadline,
         p.location, p.bid_count, p.created_at,
         pr.full_name as client_name,
         coalesce(c.verified, false) as client_verified
  from public.projects p
  join public.profiles pr on pr.id = p.client_id
  left join public.companies c on c.user_id = pr.user_id
`;

export interface ProjectFilters {
  q?: string;
  category?: string;
  projectType?: "fixed" | "hourly";
  experienceLevel?: "entry" | "intermediate" | "expert";
  minBudget?: number;
  maxBudget?: number;
  location?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function listProjects(
  filters: ProjectFilters = {}
): Promise<{ rows: ProjectRow[]; total: number }> {
  const conds: string[] = [`p.visibility = 'public'`, `p.status = $1`];
  const params: unknown[] = [filters.status ?? "open"];
  let i = 2;

  if (filters.q) {
    conds.push(`(p.title ilike $${i} or p.description ilike $${i})`);
    params.push(`%${filters.q}%`);
    i++;
  }
  if (filters.category) {
    conds.push(`p.category = $${i++}`);
    params.push(filters.category);
  }
  if (filters.projectType) {
    conds.push(`p.project_type = $${i++}`);
    params.push(filters.projectType);
  }
  if (filters.experienceLevel) {
    conds.push(`p.experience_level = $${i++}`);
    params.push(filters.experienceLevel);
  }
  if (filters.minBudget != null) {
    conds.push(`p.budget_max >= $${i++}`);
    params.push(filters.minBudget);
  }
  if (filters.maxBudget != null) {
    conds.push(`p.budget_min <= $${i++}`);
    params.push(filters.maxBudget);
  }
  if (filters.location) {
    conds.push(`p.location ilike $${i++}`);
    params.push(`%${filters.location}%`);
  }

  const where = conds.length ? `where ${conds.join(" and ")}` : "";
  const limit = Math.min(filters.limit ?? 24, 100);
  const offset = filters.offset ?? 0;

  const [rows, totals] = await Promise.all([
    query<ProjectRow>(
      `${PROJECT_SELECT} ${where} order by p.created_at desc limit ${limit} offset ${offset}`,
      params
    ),
    query<{ count: string }>(
      `select count(*) from public.projects p ${where}`,
      params
    ),
  ]);

  return { rows, total: Number(totals[0]?.count ?? 0) };
}


export async function getProjectById(id: string): Promise<ProjectRow | null> {
  const rows = await query<ProjectRow>(`${PROJECT_SELECT} where p.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function getProjectSections(projectId: string): Promise<
  { title: string; content: string; sort_order: number }[]
> {
  return query(
    `select title, content, sort_order from public.project_sections
     where project_id = $1 order by sort_order asc`,
    [projectId]
  );
}

export interface BidRow {
  id: string;
  project_id: string;
  freelancer_id: string;
  price: string;
  timeline_days: number;
  cover_letter: string;
  milestones: unknown;
  attachments: unknown;
  status: "pending" | "accepted" | "rejected" | "shortlisted";
  created_at: string;
  freelancer_name: string;
  freelancer_rating: string;
  freelancer_jobs: number;
}

export async function listBidsForProject(projectId: string): Promise<BidRow[]> {
  return query<BidRow>(
    `select b.id, b.project_id, b.freelancer_id, b.price, b.timeline_days,
            b.cover_letter, b.milestones, b.attachments, b.status, b.created_at,
            pr.full_name as freelancer_name,
            pr.rating as freelancer_rating,
            pr.completed_jobs as freelancer_jobs
     from public.bids b
     join public.profiles pr on pr.id = b.freelancer_id
     where b.project_id = $1
     order by b.created_at desc`,
    [projectId]
  );
}

export async function listBidsForFreelancer(profileId: string): Promise<BidRow[]> {
  return query<BidRow>(
    `select b.id, b.project_id, b.freelancer_id, b.price, b.timeline_days,
            b.cover_letter, b.milestones, b.attachments, b.status, b.created_at,
            pr.full_name as freelancer_name,
            pr.rating as freelancer_rating,
            pr.completed_jobs as freelancer_jobs,
            p.title as project_title
     from public.bids b
     join public.profiles pr on pr.id = b.freelancer_id
     join public.projects p on p.id = b.project_id
     where b.freelancer_id = $1
     order by b.created_at desc`,
    [profileId]
  );
}

export async function listProjectsForClient(clientProfileId: string): Promise<ProjectRow[]> {
  return query<ProjectRow>(
    `${PROJECT_SELECT} where p.client_id = $1 order by p.created_at desc`,
    [clientProfileId]
  );
}

export async function getFreelancerStats(profileId: string): Promise<{
  applications: number;
  active_bids: number;
  earnings: string;
  profile_views: number;
}> {
  const rows = await query<{
    applications: string;
    active_bids: string;
    earnings: string | null;
  }>(
    `select count(*) as applications,
            count(*) filter (where status in ('pending','shortlisted')) as active_bids,
            coalesce(sum(price) filter (where status = 'accepted'), 0) as earnings
     from public.bids where freelancer_id = $1`,
    [profileId]
  );
  const views = await query<{ views: string }>(
    `select coalesce(sum(bid_count), 0) as views from public.projects where client_id = $1`,
    [profileId]
  );
  return {
    applications: Number(rows[0]?.applications ?? 0),
    active_bids: Number(rows[0]?.active_bids ?? 0),
    earnings: rows[0]?.earnings ?? "0",
    profile_views: Number(views[0]?.views ?? 0),
  };
}
