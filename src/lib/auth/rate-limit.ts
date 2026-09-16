import "server-only";
import { query } from "@/lib/db/postgres";

/**
 * Fixed-window rate limiter backed by the rate_limits table.
 * Atomic-ish: single upsert with window reset. Good enough for
 * login/registration/bid spam protection without external infra.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ ok: boolean; remaining: number; retryAfter?: number }> {
  const rows = await query<{ count: number; window_start: Date; inside: boolean; remaining: number; retry_after: number | null }>(
    `with upsert as (
       insert into public.rate_limits (key, count, window_start)
       values ($1, 1, now())
       on conflict (key) do update set
         count = case
           when public.rate_limits.window_start < now() - ($2 || ' seconds')::interval then 1
           else public.rate_limits.count + 1
         end,
         window_start = case
           when public.rate_limits.window_start < now() - ($2 || ' seconds')::interval then now()
           else public.rate_limits.window_start
         end
       returning count, window_start
     )
     select count, window_start,
       window_start >= now() - ($2 || ' seconds')::interval as inside,
       ($3 - count) as remaining,
       case when count > $3
         then ceil(extract(epoch from (window_start + ($2 || ' seconds')::interval - now())))::int
         else null end as retry_after
     from upsert`,
    [key, String(windowSeconds), limit]
  );

  const row = rows[0];
  if (!row) return { ok: true, remaining: limit - 1 };
  if (row.retry_after !== null) {
    return { ok: false, remaining: 0, retryAfter: row.retry_after };
  }
  return { ok: true, remaining: row.remaining };
}
