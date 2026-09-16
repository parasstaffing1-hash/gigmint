/**
 * Seed script — populates Aiven with realistic demo data.
 * Idempotent: keyed on fixed emails; reruns refresh instead of duplicating.
 *
 * Usage: npm run db:seed
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { Client } from "pg";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number }
) => Promise<Buffer>;

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

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64, { N: 16384, r: 8, p: 1 })) as Buffer;
  return `scrypt:16384:8:1:${salt}:${derived.toString("hex")}`;
}

async function main() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not set");
  const client = new Client({
    connectionString: raw.replace(/[?&]sslmode=[^&]*/g, ""),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const passwordHash = await hashPassword("Password123");

  // ------------------------------------------------------------------ users
  const users: { email: string; name: string; role: string; meta: object }[] = [
    { email: "alex@techcorp.demo", name: "Alex Morgan", role: "client", meta: {} },
    { email: "sarah@freelance.demo", name: "Sarah Chen", role: "freelancer", meta: {} },
    { email: "marcus@freelance.demo", name: "Marcus Rodriguez", role: "freelancer", meta: {} },
    { email: "aiko@freelance.demo", name: "Aiko Tanaka", role: "freelancer", meta: {} },
    { email: "david@freelance.demo", name: "David Kim", role: "freelancer", meta: {} },
    { email: "founder@pickupapp.demo", name: "PickupApp Founder", role: "client", meta: {} },
  ];

  const userIds: Record<string, string> = {};
  const profileIds: Record<string, string> = {};

  for (const u of users) {
    const existing = await client.query<{ id: string }>(
      "select id from auth.users where email = $1",
      [u.email]
    );
    let uid: string;
    if (existing.rows[0]) {
      uid = existing.rows[0].id;
      await client.query("update auth.users set encrypted_password = $2 where id = $1", [
        uid,
        passwordHash,
      ]);
    } else {
      const ins = await client.query<{ id: string }>(
        `insert into auth.users (email, encrypted_password, raw_user_meta_data)
         values ($1, $2, $3) returning id`,
        [u.email, passwordHash, JSON.stringify({ full_name: u.name, role: u.role })]
      );
      uid = ins.rows[0].id;
    }
    userIds[u.email] = uid;

    // profile is auto-created by trigger; set its fields
    await client.query(
      `update public.profiles set
         full_name = $2, role = $3,
         location = $4,
         hourly_rate = $5,
         bio = $6,
         skills = $7::text[]
       where user_id = $1`,
      [
        uid,
        u.name,
        u.role,
        u.role === "freelancer" ? "Remote" : "San Francisco, CA",
        u.role === "freelancer" ? 95 : null,
        u.role === "freelancer"
          ? "Senior developer focused on shipping quality products end to end."
          : "Building products and hiring great people.",
        u.role === "freelancer" ? ["React", "TypeScript", "Node.js"] : [],
      ]
    );

    const prof = await client.query<{ id: string }>(
      "select id from public.profiles where user_id = $1",
      [uid]
    );
    profileIds[u.email] = prof.rows[0].id;
  }

  // company for the main client
  await client.query(
    `insert into public.companies (user_id, name, verified, description)
     values ($1, 'TechCorp Inc.', true, 'SaaS analytics company.')
     on conflict do nothing`,
    [userIds["alex@techcorp.demo"]]
  );

  // --------------------------------------------------------------- projects
  const projects: {
    clientEmail: string;
    title: string;
    description: string;
    category: string;
    min: number;
    max: number;
    type: string;
    level: string;
    skills: string[];
    location: string;
    sections: { title: string; content: string }[];
  }[] = [
    {
      clientEmail: "founder@pickupapp.demo",
      title: "Launch Campaign for a Two-Sided Local Pickup App",
      description:
        "Run the first real marketing campaign for a live two-sided order-ahead pickup app: sign-ups on both sides — local businesses joining as partner stores, and customers installing and ordering.",
      category: "Digital Marketing",
      min: 5000,
      max: 10000,
      type: "fixed",
      level: "intermediate",
      skills: ["Meta Ads", "Instagram", "TikTok", "Content Strategy", "Copywriting", "Analytics"],
      location: "Remote — Australia preferred",
      sections: [
        {
          title: "The Business",
          content:
            "A SaaS order-ahead pickup app, live on the App Store and operating in Australia. Customers order ahead from local businesses, then either collect at the counter or stay in the car and have the order brought out to them.",
        },
        {
          title: "Where I Am At",
          content:
            "The product side is done. Built, beta tested, live on the App Store. What I do not have is real-world performance data, because no marketing has been run at all.",
        },
        {
          title: "The Goal",
          content:
            "Sign-ups on both sides: local businesses joining as partner stores, and customers installing and ordering.",
        },
        { title: "What I Need", content: "A practical, hands-on marketing plan and execution." },
        { title: "How To Apply", content: "Tell me exactly how you would approach this and why." },
      ],
    },
    {
      clientEmail: "alex@techcorp.demo",
      title: "Build a SaaS Dashboard with Real-Time Analytics",
      description:
        "We're building the next generation of B2B analytics software. Our platform helps businesses understand their data through beautiful, interactive dashboards. We need a developer who can bring our Figma designs to life.",
      category: "Web Development",
      min: 5000,
      max: 10000,
      type: "fixed",
      level: "expert",
      skills: ["React", "TypeScript", "D3.js", "PostgreSQL", "WebSocket", "Redis"],
      location: "San Francisco, CA",
      sections: [
        { title: "Project Description", content: "Build the customer-facing analytics dashboard with real-time updates." },
        { title: "Requirements", content: "5+ years React, strong TypeScript, experience with D3 and WebSocket-based data feeds." },
      ],
    },
    {
      clientEmail: "alex@techcorp.demo",
      title: "Design a Premium Mobile App UI/UX",
      description:
        "Looking for a design lead to craft a premium mobile experience for our fintech app. You will own the design system, key flows, and handoff.",
      category: "UI/UX Design",
      min: 3000,
      max: 6000,
      type: "fixed",
      level: "expert",
      skills: ["Figma", "Prototyping", "iOS Design", "Design Systems"],
      location: "New York, NY",
      sections: [
        { title: "Project Description", content: "Own end-to-end design for our iOS app relaunch." },
      ],
    },
    {
      clientEmail: "alex@techcorp.demo",
      title: "AI-Powered Content Generation Platform",
      description:
        "Build an AI content platform: prompt orchestration, streaming responses, usage metering, and a clean editing UI.",
      category: "AI & Machine Learning",
      min: 15000,
      max: 25000,
      type: "fixed",
      level: "expert",
      skills: ["Python", "OpenAI", "FastAPI", "Next.js"],
      location: "Remote",
      sections: [
        { title: "Project Description", content: "MVP in 3 months; scale after." },
      ],
    },
    {
      clientEmail: "alex@techcorp.demo",
      title: "E-commerce Store Migration to Headless",
      description:
        "Migrate a WooCommerce store (~2,000 SKUs) to a headless stack with a custom storefront and preserved SEO.",
      category: "Web Development",
      min: 8000,
      max: 15000,
      type: "fixed",
      level: "intermediate",
      skills: ["Next.js", "Shopify", "SEO", "Node.js"],
      location: "Remote",
      sections: [{ title: "Project Description", content: "Zero-downtime migration with SEO parity." }],
    },
  ];

  const projectIds: string[] = [];
  for (const p of projects) {
    const clientId = profileIds[p.clientEmail];
    const existing = await client.query<{ id: string }>(
      "select id from public.projects where title = $1 and client_id = $2",
      [p.title, clientId]
    );
    let pid: string;
    if (existing.rows[0]) {
      pid = existing.rows[0].id;
      await client.query(
        `update public.projects set description=$2, category=$3, budget_min=$4, budget_max=$5,
           project_type=$6, experience_level=$7, skills=$8::text[], location=$9, status='open'
         where id=$1`,
        [pid, p.description, p.category, p.min, p.max, p.type, p.level, p.skills, p.location]
      );
    } else {
      const ins = await client.query<{ id: string }>(
        `insert into public.projects
           (client_id, title, description, category, budget_min, budget_max, project_type,
            status, experience_level, skills, location, bid_count)
         values ($1,$2,$3,$4,$5,$6,$7,'open',$8,$9,$10,0) returning id`,
        [clientId, p.title, p.description, p.category, p.min, p.max, p.type, p.level, p.skills, p.location]
      );
      pid = ins.rows[0].id;
    }
    projectIds.push(pid);

    for (let i = 0; i < p.sections.length; i++) {
      const s = p.sections[i];
      const exists = await client.query("select 1 from public.project_sections where project_id=$1 and title=$2", [pid, s.title]);
      if (exists.rows[0]) continue;
      await client.query(
        `insert into public.project_sections (project_id, title, content, sort_order)
         values ($1,$2,$3,$4)`,
        [pid, s.title, s.content, i]
      );
    }
  }

  // ------------------------------------------------------------------- bids
  const freelancerEmails = ["sarah@freelance.demo", "marcus@freelance.demo", "aiko@freelance.demo", "david@freelance.demo"];
  let bidCount = 0;
  for (const pid of projectIds) {
    for (const email of freelancerEmails.slice(0, bidCount % 3 === 0 ? 3 : 2)) {
      const fid = profileIds[email];
      const dup = await client.query("select 1 from public.bids where project_id=$1 and freelancer_id=$2", [pid, fid]);
      if (dup.rows[0]) continue;
      await client.query(
        `insert into public.bids (project_id, freelancer_id, price, timeline_days, cover_letter, status)
         values ($1,$2,$3,$4,$5,'pending')`,
        [pid, fid, 4500 + Math.floor(Math.random() * 3000), 21, "I have shipped similar projects end to end — see my portfolio for comparable work and outcomes."]
      );
      bidCount++;
    }
    await client.query(`update public.projects set bid_count = (select count(*) from public.bids where project_id=$1) where id=$1`, [pid]);
  }

  const counts = await client.query<{ users: string; projects: string; bids: string; sections: string }>(
    `select
       (select count(*) from auth.users) as users,
       (select count(*) from public.projects) as projects,
       (select count(*) from public.bids) as bids,
       (select count(*) from public.project_sections) as sections`
  );
  console.log("✓ Seed complete:", counts.rows[0]);

  await client.end();
}

main().catch((err) => {
  console.error("Seed error:", err.message);
  process.exit(1);
});
