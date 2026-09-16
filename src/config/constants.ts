export const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Video Production",
  "Data Science",
  "AI & Machine Learning",
  "Blockchain & Web3",
  "DevOps & Cloud",
  "Cybersecurity",
  "Game Development",
  "Virtual Reality",
  "Business Consulting",
] as const;

export const SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Node.js",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Kubernetes",
  "Figma",
  "Adobe Photoshop",
  "Swift",
  "Kotlin",
  "Flutter",
  "React Native",
  "Vue.js",
  "Angular",
  "Svelte",
  "Tailwind CSS",
  "GraphQL",
  "REST APIs",
  "Redis",
  "Firebase",
  "Supabase",
  "Git",
  "CI/CD",
  "Machine Learning",
  "TensorFlow",
  "Solidity",
  "Rust",
  "Go",
  "Java",
  "C#",
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
] as const;

export const BUDGET_RANGES = [
  { label: "Under $500", min: 0, max: 500 },
  { label: "$500 - $1,000", min: 500, max: 1000 },
  { label: "$1,000 - $5,000", min: 1000, max: 5000 },
  { label: "$5,000 - $10,000", min: 5000, max: 10000 },
  { label: "$10,000 - $50,000", min: 10000, max: 50000 },
  { label: "$50,000+", min: 50000, max: null },
] as const;

export const PROJECT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-[#9b9a97]" },
  open: { label: "Open", color: "bg-[#0f7b6c]" },
  in_progress: { label: "In Progress", color: "bg-[#2383e2]" },
  completed: { label: "Completed", color: "bg-[#0f7b6c]" },
  cancelled: { label: "Cancelled", color: "bg-[#e03e3e]" },
};

export const BID_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-[#dfab01]" },
  accepted: { label: "Accepted", color: "bg-[#0f7b6c]" },
  rejected: { label: "Rejected", color: "bg-[#e03e3e]" },
  shortlisted: { label: "Shortlisted", color: "bg-[#2383e2]" },
};

export const NAV_LINKS = {
  client: [
    { label: "Dashboard", href: "/client/dashboard" },
    { label: "Projects", href: "/projects" },
    { label: "Messages", href: "/messages" },
  ],
  freelancer: [
    { label: "Dashboard", href: "/freelancer/dashboard" },
    { label: "Browse Projects", href: "/projects" },
    { label: "Messages", href: "/messages" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users", href: "/admin/users" },
    { label: "Projects", href: "/admin/projects" },
  ],
} as const;
