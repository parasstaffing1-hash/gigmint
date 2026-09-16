"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { query, withTransaction } from "@/lib/db/postgres";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getCurrentUser,
} from "./session";
import { rateLimit } from "./rate-limit";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[a-zA-Z]/, "Include at least one letter")
    .regex(/[0-9]/, "Include at least one number"),
  role: z.enum(["client", "freelancer"]),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required"),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function zodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

async function clientMeta() {
  const h = await headers();
  return {
    userAgent: h.get("user-agent") ?? undefined,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim(),
  };
}

export type AuthResult =
  | { ok: true; redirectTo: string }
  | { ok: false; errors: Record<string, string> };

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function registerAction(
  _prev: unknown,
  formData: FormData
): Promise<AuthResult> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error) };
  const { fullName, email, password, role } = parsed.data;

  // Rate limit by IP: 5 registrations / hour
  const meta = await clientMeta();
  const rl = await rateLimit(`register:${meta.ip ?? "unknown"}`, 5, 3600);
  if (!rl.ok) {
    return { ok: false, errors: { form: `Too many attempts. Try again in ${Math.ceil((rl.retryAfter ?? 3600) / 60)} minutes.` } };
  }

  const existing = await query("select 1 from auth.users where email = $1", [email]);
  if (existing.length > 0) {
    return { ok: false, errors: { email: "An account with this email already exists" } };
  }

  const passwordHash = await hashPassword(password);

  // Create auth user + profile in one transaction. The on_auth_user_created
  // trigger (migration 001) auto-creates the profile row; we then set the
  // chosen role + name on it.
  const userId = await withTransaction(async (tx) => {
    const inserted = await tx.query<{ id: string }>(
      `insert into auth.users (email, encrypted_password, raw_user_meta_data)
       values ($1, $2, $3) returning id`,
      [email, passwordHash, JSON.stringify({ full_name: fullName, role })]
    );
    const uid = inserted.rows[0].id;

    await tx.query(
      `update public.profiles set full_name = $2, role = $3 where user_id = $1`,
      [uid, fullName, role]
    );
    return uid;
  });

  await createSession(userId, meta);
  redirect(role === "client" ? "/client/dashboard" : "/freelancer/dashboard");
}

export async function loginAction(
  _prev: unknown,
  formData: FormData
): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error) };
  const { email, password } = parsed.data;

  const meta = await clientMeta();
  // Rate limit per email AND per IP: 10 attempts / 15 min
  const [byEmail, byIp] = await Promise.all([
    rateLimit(`login:email:${email}`, 10, 900),
    rateLimit(`login:ip:${meta.ip ?? "unknown"}`, 30, 900),
  ]);
  if (!byEmail.ok || !byIp.ok) {
    return { ok: false, errors: { form: "Too many attempts. Try again shortly." } };
  }

  const rows = await query<{ id: string; encrypted_password: string }>(
    "select id, encrypted_password from auth.users where email = $1",
    [email]
  );
  const user = rows[0];

  // Constant-shape response: verify against a dummy hash on miss to avoid
  // user-enumeration timing signals.
  const DUMMY_HASH =
    "scrypt:16384:8:1:00000000000000000000000000000000:" + "0".repeat(128);
  const ok = user
    ? await verifyPassword(password, user.encrypted_password ?? "")
    : (await verifyPassword(password, DUMMY_HASH), false);

  if (!user || !ok) {
    return { ok: false, errors: { form: "Invalid email or password" } };
  }

  await createSession(user.id, meta);
  await pruneExpiredSessionsSafe();

  const roleRows = await query<{ role: string }>(
    "select role from public.profiles where user_id = $1",
    [user.id]
  );
  const role = roleRows[0]?.role ?? "freelancer";
  redirect(role === "client" ? "/client/dashboard" : "/freelancer/dashboard");
}

async function pruneExpiredSessionsSafe() {
  try {
    const { pruneExpiredSessions } = await import("./session");
    await pruneExpiredSessions();
  } catch {
    // non-fatal
  }
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function getMe() {
  return getCurrentUser();
}
