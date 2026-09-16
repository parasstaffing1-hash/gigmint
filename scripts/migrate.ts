/**
 * Migration runner — applies SQL migrations in order.
 *
 * The schema was written for Supabase (references auth.users). Running on
 * plain Postgres (Aiven) requires an auth.users stub first; this script
 * creates it if missing, then applies each migration inside a transaction.
 *
 * Usage: npx tsx scripts/migrate.ts
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

// Minimal .env.local loader (keys/values, # comments) — avoids a dotenv dep
function loadEnvLocal() {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^"|"$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");

async function getMigrationsClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not set (.env.local)");
  const connectionString = raw.replace(/[?&]sslmode=[^&]*/g, "");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

/** Supabase schemas/tables/functions the migrations assume exist. */
const AUTH_STUB_SQL = `
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  encrypted_password text,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Supabase-compat auth.uid(): on Supabase it reads the request JWT.
-- On plain Postgres we simulate it via a session variable, so RLS policies
-- work identically: set_config('app.current_user_id', '<uuid>') before queries.
create or replace function auth.uid() returns uuid as $$
  select nullif(current_setting('app.current_user_id', true), '')::uuid;
$$ language sql stable;
`;

async function main() {
  const client = await getMigrationsClient();

  try {
    // 0. Supabase-compat stub so migrations referencing auth.users work.
    await client.query(AUTH_STUB_SQL);
    console.log("✓ auth.users stub ready");

    // 1. Migration tracking table
    await client.query(`
      create table if not exists schema_migrations (
        name text primary key,
        applied_at timestamp default now()
      );
    `);

    // 2. Pending migrations, sorted
    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    const applied = await client.query<{ name: string }>(
      "select name from schema_migrations"
    );
    const appliedNames = new Set(applied.rows.map((r) => r.name));

    const pending = files.filter((f) => !appliedNames.has(f));
    if (pending.length === 0) {
      console.log("✓ No pending migrations — database is up to date");
      return;
    }

    for (const file of pending) {
      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
      process.stdout.write(`Applying ${file}... `);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("insert into schema_migrations (name) values ($1)", [file]);
        await client.query("COMMIT");
        console.log("✓");
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("✗ FAILED");
        throw new Error(
          `Migration ${file} failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    console.log(`✓ Applied ${pending.length} migration(s)`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration error:", err.message);
  process.exit(1);
});
