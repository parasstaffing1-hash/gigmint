import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3456";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/projects", "/login", "/register"],
        disallow: ["/api/", "/client/", "/freelancer/", "/admin/", "/messages", "/notifications", "/profile"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
