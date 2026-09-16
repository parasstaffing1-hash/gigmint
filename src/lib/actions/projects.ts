"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { query, withTransaction } from "@/lib/db/postgres";
import { requireUser, requireRole } from "@/lib/auth/session";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const projectSchema = z.object({
  title: z.string().trim().min(10, "Title must be at least 10 characters").max(120),
  description: z.string().trim().min(50, "Description must be at least 50 characters"),
  category: z.string().min(1, "Pick a category"),
  budgetMin: z.coerce.number().positive("Budget must be positive").max(10_000_000),
  budgetMax: z.coerce.number().positive("Budget must be positive").max(10_000_000),
  projectType: z.enum(["fixed", "hourly"]),
  experienceLevel: z.enum(["entry", "intermediate", "expert"]),
  skills: z.array(z.string().trim().min(1)).max(15),
  deadline: z.string().optional().nullable(),
  location: z.string().trim().max(120).optional().nullable(),
}).refine((d) => d.budgetMax >= d.budgetMin, {
  message: "Max budget must be ≥ min budget",
  path: ["budgetMax"],
});

const bidSchema = z.object({
  projectId: z.string().uuid(),
  price: z.coerce.number().positive("Price must be positive").max(10_000_000),
  timelineDays: z.coerce.number().int().min(1, "Minimum 1 day").max(365),
  coverLetter: z.string().trim().min(100, "Cover letter must be at least 100 characters").max(5000),
  milestones: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(120),
        amount: z.coerce.number().positive(),
      })
    )
    .max(10)
    .optional()
    .default([]),
  attachments: z
    .array(
      z.object({
        key: z.string(),
        url: string_nonempty(),
        name: z.string().max(200),
        size: z.coerce.number().int().nonnegative(),
        contentType: z.string().max(100),
      })
    )
    .max(10)
    .optional()
    .default([]),
});

// small helper so the schema file reads cleanly
function string_nonempty() {
  return z.string().min(1);
}

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string> };

function zodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function createProjectAction(
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireRole("client");

  // Form fields arrive flat; skills/attachments/milestones arrive as JSON strings
  const rawSkills = safeJsonParse<string[]>(formData.get("skills"));
  const rawAttachments = safeJsonParse<
    { key: string; url: string; name: string; size: number; contentType: string }[]
  >(formData.get("attachments"));

  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    budgetMin: formData.get("budgetMin"),
    budgetMax: formData.get("budgetMax"),
    projectType: formData.get("projectType"),
    experienceLevel: formData.get("experienceLevel"),
    skills: Array.isArray(rawSkills) ? rawSkills : [],
    deadline: formData.get("deadline") || null,
    location: formData.get("location") || null,
  });
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error) };
  const d = parsed.data;

  const rows = await query<{ id: string }>(
    `insert into public.projects
       (client_id, title, description, category, budget_min, budget_max,
        project_type, status, experience_level, skills, deadline, location, attachments)
     values ($1,$2,$3,$4,$5,$6,$7,'open',$8,$9,$10,$11,$12)
     returning id`,
    [
      user.profileId,
      d.title,
      d.description,
      d.category,
      d.budgetMin,
      d.budgetMax,
      d.projectType,
      d.experienceLevel,
      d.skills,
      d.deadline ? new Date(d.deadline) : null,
      d.location ?? null,
      JSON.stringify(Array.isArray(rawAttachments) ? rawAttachments : []),
    ]
  );

  revalidatePath("/projects");
  revalidatePath("/client/dashboard");
  return { ok: true, id: rows[0].id };
}

// ---------------------------------------------------------------------------
// Bids
// ---------------------------------------------------------------------------

export async function submitBidAction(
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireRole("freelancer", "client", "admin");

  const rawMilestones = safeJsonParse<{ title: string; amount: number }[]>(
    formData.get("milestones")
  );
  const rawAttachments = safeJsonParse<
    { key: string; url: string; name: string; size: number; contentType: string }[]
  >(formData.get("attachments"));

  const parsed = bidSchema.safeParse({
    projectId: formData.get("projectId"),
    price: formData.get("price"),
    timelineDays: formData.get("timelineDays"),
    coverLetter: formData.get("coverLetter"),
    milestones: Array.isArray(rawMilestones) ? rawMilestones : [],
    attachments: Array.isArray(rawAttachments) ? rawAttachments : [],
  });
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error) };
  const d = parsed.data;

  // Freelancer profile required for bids
  const prof = await query<{ id: string }>(
    `select id from public.profiles where user_id = $1 and role in ('freelancer','admin')`,
    [user.userId]
  );
  if (!prof[0]) {
    return { ok: false, errors: { form: "Only freelancers can submit bids" } };
  }

  // Project must be open
  const proj = await query<{ id: string; status: string }>(
    `select id, status from public.projects where id = $1`,
    [d.projectId]
  );
  if (!proj[0] || proj[0].status !== "open") {
    return { ok: false, errors: { form: "This project is not accepting bids" } };
  }

  try {
    await withTransaction(async (tx) => {
      await tx.query(
        `insert into public.bids (project_id, freelancer_id, price, timeline_days, cover_letter, milestones, attachments)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [
          d.projectId,
          prof[0].id,
          d.price,
          d.timelineDays,
          d.coverLetter,
          JSON.stringify(d.milestones),
          JSON.stringify(d.attachments),
        ]
      );
      await tx.query(
        `update public.projects set bid_count = bid_count + 1 where id = $1`,
        [d.projectId]
      );
    });
  } catch (err) {
    // unique(project_id, freelancer_id) violation → friendly duplicate message
    if (err instanceof Error && err.message.includes("duplicate key")) {
      return { ok: false, errors: { form: "You already submitted a bid on this project" } };
    }
    throw err;
  }

  revalidatePath(`/projects/${d.projectId}`);
  return { ok: true, id: d.projectId };
}

// ---------------------------------------------------------------------------
// Bid status transitions (client actions)
// ---------------------------------------------------------------------------

const bidStatusSchema = z.object({
  bidId: z.string().uuid(),
  status: z.enum(["shortlisted", "rejected", "accepted"]),
});

export async function updateBidStatusAction(
  bidId: string,
  status: "shortlisted" | "rejected" | "accepted"
): Promise<ActionResult> {
  const parsed = bidStatusSchema.safeParse({ bidId, status });
  if (!parsed.success) return { ok: false, errors: { form: "Invalid request" } };
  const user = await requireRole("client", "admin");

  // Ownership check: the bid's project must belong to this client
  const rows = await query<{ project_id: string; client_user: string; project_status: string }>(
    `select b.project_id, p.user_id as client_user, prj.status as project_status
     from public.bids b
     join public.projects prj on prj.id = b.project_id
     join public.profiles p on p.id = prj.client_id
     where b.id = $1`,
    [bidId]
  );
  const row = rows[0];
  if (!row) return { ok: false, errors: { form: "Bid not found" } };
  if (user.role !== "admin" && row.client_user !== user.userId) {
    return { ok: false, errors: { form: "Not your project" } };
  }

  await withTransaction(async (tx) => {
    await tx.query(`update public.bids set status = $2, updated_at = now() where id = $1`, [
      bidId,
      status,
    ]);

    // Accepting a bid → project in_progress, other bids auto-rejected
    if (status === "accepted") {
      await tx.query(`update public.projects set status = 'in_progress' where id = $1`, [
        row.project_id,
      ]);
      await tx.query(
        `update public.bids set status = 'rejected', updated_at = now()
         where project_id = $1 and id <> $2 and status in ('pending','shortlisted')`,
        [row.project_id, bidId]
      );
    }
  });

  revalidatePath(`/projects/${row.project_id}`);
  revalidatePath("/client/dashboard");
  return { ok: true, id: bidId };
}

// ---------------------------------------------------------------------------
// utils
// ---------------------------------------------------------------------------

function safeJsonParse<T>(value: FormData | FormDataEntryValue | null): T | null {
  if (typeof value !== "string" || !value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
