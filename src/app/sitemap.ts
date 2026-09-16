import type { MetadataRoute } from "next";
import { listPublicProjectIds } from "@/lib/db/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3456";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/projects`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/register`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/legal/terms`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${base}/legal/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${base}/legal/cookies`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const projects = await listPublicProjectIds();
  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/projects/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
