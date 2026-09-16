import { Pool, type PoolClient } from "pg";

// ---------------------------------------------------------------------------
// Postgres connection (Aiven / any Postgres with SSL)
//
// Two env approaches:
//   1. DATABASE_URL without sslmode → SSL config comes from code below
//   2. DATABASE_URL with sslmode=require → fine in Node 18+ with CA cert,
//      but self-signed CAs (Aiven default) need the code-side SSL override,
//      so we strip sslmode and configure SSL ourselves.
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __gigmintPool: Pool | undefined;
}

function createPool(): Pool {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (see .env.example)."
    );
  }

  // Strip sslmode so the `ssl` object below isn't overridden by the URL.
  const connectionString = raw.replace(/[?&]sslmode=[^&]*/g, "");

  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Aiven uses self-signed CA certs
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export const pool: Pool =
  globalThis.__gigmintPool ?? (globalThis.__gigmintPool = createPool());

export async function query<T = any>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(text, params) as unknown as { rows: T[] };
  return result.rows;
}

/** Runs `fn` inside a transaction; rolls back on throw. */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function dbHealthCheck(): Promise<{ ok: boolean; version?: string; error?: string }> {
  try {
    const rows = await query<{ version: string }>("select version()");
    return { ok: true, version: rows[0]?.version };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
