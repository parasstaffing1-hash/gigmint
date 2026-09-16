import "server-only";
import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { query, withTransaction } from "@/lib/db/postgres";
import { cache } from "react";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number }
) => Promise<Buffer>;

export const SESSION_COOKIE = "gigmint_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keylen: 64 };

// ---------------------------------------------------------------------------
// Password hashing (scrypt — no native deps, strong default)
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, SCRYPT_PARAMS.keylen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  })) as Buffer;
  return `scrypt:${SCRYPT_PARAMS.N}:${SCRYPT_PARAMS.r}:${SCRYPT_PARAMS.p}:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, N, r, p, salt, hex] = stored.split(":");
    if (scheme !== "scrypt") return false;
    const derived = (await scryptAsync(password, salt, Buffer.from(hex, "hex").length, {
      N: Number(N),
      r: Number(r),
      p: Number(p),
    })) as Buffer;
    return timingSafeEqual(derived, Buffer.from(hex, "hex"));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a session row + sets the httpOnly cookie. Returns the raw token. */
export async function createSession(
  userId: string,
  meta?: { userAgent?: string; ip?: string }
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const id = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await query(
    `insert into public.sessions (id, user_id, expires_at, user_agent, ip)
     values ($1, $2, $3, $4, $5)`,
    [id, userId, expiresAt, meta?.userAgent ?? null, meta?.ip ?? null]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await query("delete from public.sessions where id = $1", [hashToken(token)]);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export interface SessionUser {
  profileId: string;
  userId: string;
  email: string;
  fullName: string;
  role: "client" | "freelancer" | "admin";
  avatarUrl: string | null;
}

/**
 * Current user for this request. React `cache` dedupes within a render pass,
 * so calling it from multiple components hits the DB once.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await query<{
    profile_id: string;
    user_id: string;
    email: string;
    full_name: string;
    role: "client" | "freelancer" | "admin";
    avatar_url: string | null;
  }>(
    `select p.id as profile_id, u.id as user_id, u.email, p.full_name, p.role, p.avatar_url
     from public.sessions s
     join auth.users u on u.id = s.user_id
     join public.profiles p on p.user_id = u.id
     where s.id = $1 and s.expires_at > now()`,
    [hashToken(token)]
  );

  const row = rows[0];
  if (!row) return null;
  return {
    profileId: row.profile_id,
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    avatarUrl: row.avatar_url,
  };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Authentication required", 401);
  return user;
}

export async function requireRole(
  ...roles: SessionUser["role"][]
): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new AuthError(`Requires role: ${roles.join(" or ")}`, 403);
  }
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** Opportunistic cleanup — call after login (cheap, indexed). */
export async function pruneExpiredSessions(): Promise<void> {
  await query("delete from public.sessions where expires_at < now()");
}

export { withTransaction };
