import "server-only";
import { query } from "@/lib/db/postgres";

export async function listPublicProjectIds(): Promise<
  { id: string; updated_at: string }[]
> {
  try {
    return await query<{ id: string; updated_at: string }>(
      `select id, updated_at from public.projects
       where visibility = 'public' and status = 'open'
       order by created_at desc limit 500`
    );
  } catch {
    return []; // sitemap must not break the build if DB is unreachable
  }
}
