"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  DollarSign,
  MapPin,
  Clock,
  Shield,
  ShieldCheck,
  Send,
  Bookmark,
  Share2,
  BadgeCheck,
  CircleCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SubmitBidDialog } from "@/components/bid/submit-bid-dialog";
import { EscrowPanel } from "@/components/payments/escrow-panel";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { PROJECT_STATUS_LABELS } from "@/config/constants";

// ---------------------------------------------------------------------------
// Demo listing data — replace with a Supabase query on `projects` + `profiles`
// when the backend is wired up. The UI structure is data-driven: sections,
// deliverables, budget and client info all render from this object.
// ---------------------------------------------------------------------------

const project = {
  id: "1",
  title: "Launch Campaign for a Two-Sided Local Pickup App",
  description:
    "Run the first real marketing campaign for a live two-sided order-ahead pickup app: sign-ups on both sides — local businesses joining as partner stores, and customers installing and ordering.",
  category: "Digital Marketing",
  budget_min: 5000,
  budget_max: 10000,
  project_type: "fixed" as const,
  status: "open" as const,
  experience_level: "intermediate" as const,
  skills: ["Meta Ads", "Instagram", "TikTok", "Content Strategy", "Copywriting", "Analytics"],
  deadline: "2026-12-01",
  location: "Remote — Australia preferred",
  bid_count: 12,
  created_at: "2026-09-10T10:00:00Z",
  client: {
    name: "PickupApp Pty Ltd",
    verified: true,
    payment_verified: true,
    jobs_posted: 8,
    hire_rate: 92,
    member_since: "2024",
  },
  sections: [
    {
      title: "The Business",
      paragraphs: [
        "A SaaS order-ahead pickup app, live on the App Store and operating in Australia. Customers order ahead from local businesses, then either collect at the counter or stay in the car and have the order brought out to them. It is a two-sided marketplace under two brands in one app: one for food and drink, one for other local businesses.",
        "It is a simple product and you will not need weeks to understand it. Brand name, app access, screenshots, footage, logos and full context are shared as soon as we engage. The brand is not published in this listing and the founder expects the usual discretion until the campaign is live — no NDA paperwork needed, the marketplace already requires you to keep founder information confidential.",
      ],
    },
    {
      title: "Where I Am At",
      paragraphs: [
        "The product side is done. Built, beta tested, live on the App Store. What I do not have is real-world performance data, because no marketing has been run at all — zero ads, nothing tested. I have an Instagram account and a Meta account and that is it.",
        "I am not a marketer and I do not know exactly what I need — that is the point of hiring you.",
      ],
    },
    {
      title: "The Goal",
      paragraphs: [
        "Sign-ups on both sides: local businesses joining as partner stores, and customers installing and ordering. I want as much reach as possible — content people actually share, not corporate filler. But be honest with me about the trade-off: I would rather have a few hundred real users in areas where partner stores exist than a million views in places we cannot service yet. Tell me how you would balance that.",
      ],
    },
    {
      title: "What I Need",
      list: [
        "Understand the product.",
        "Tell me what you recommend, in plain English — which side to push first, which platforms, what to spend, and what each ad should say.",
        "Make the ads: one strong concept for customers, one for business owners. Whatever you recommend.",
        "Get them live — either run them in my Meta setup or your ad platforms, or give me step-by-step instructions.",
        "After they have run, tell me what the numbers mean and what you would do next.",
      ],
    },
    {
      title: "Nice to Have",
      paragraphs: [
        "Based in Australia, so you understand the market first-hand. Even better if you own or work in a local business, because you can sign up and experience the product from the business side yourself. Test access can be arranged either way so you can see the whole thing end to end before you write a word. Tech, dev, product or app-marketing experience is a real plus — understanding how a two-sided app actually works matters more than a big portfolio.",
      ],
    },
    {
      title: "What Happens Next If It Works",
      paragraphs: [
        "This is the first of several contracts, not a one-off. If these ads perform, I will fund more work at higher value: more creative for both sides, ongoing monthly work, and the USA, Canada and New Zealand launches. Each is issued and funded separately — no commission-only or unpaid work is asked for or offered here.",
      ],
    },
    {
      title: "How To Apply",
      paragraphs: [
        "Do not send a generic pitch.",
      ],
      list: [
        "Show me your work/resume: 2 to 3 ads you have actually run, with real numbers (platform, spend, and the result). Link your own accounts if reach is part of what you bring. I just want to see your results.",
        "In your own words: which side of a two-sided local pickup marketplace would you advertise to first or both at the same time, and why? Short answer is fine, I want to see how you think.",
        "Where you are based, any tech or app experience, and your timeline.",
      ],
      outro: "Applications with no real work and no point of view will not be reviewed.",
    },
    {
      title: "Your Own Audience / Accounts",
      paragraphs: [
        "If you have real followings on TikTok, Instagram, Facebook or X, or your own ad account, that is a plus and I am happy for you to post on my behalf, since the traffic points back to my app and my pages either way. Two conditions: paid ads must run through MY Meta business account so I own the data, audiences and learnings, and anything you post must link to my app and my accounts, not yours.",
      ],
    },
    {
      title: "Terms",
      list: [
        "Fixed price, funded via TRW Escrow, released when the work is delivered and approved.",
        "Quick check-in on the angles before you build the finals, so we are not guessing.",
        "Two rounds of revisions included.",
        "Australian English. No invented claims, fake reviews or made-up statistics. Do not state any price, fee or commission figure unless I confirm it in writing.",
        "Meta / Instagram / TikTok / Apple ad policy compliant. Source files handed over.",
        "Full IP transfers to me on release of funds.",
        "Account access is via limited partner access only. I do not share passwords, and ad spend is paid by me directly, separate from your fee.",
      ],
    },
  ],
  keyDeliverables: [
    "Your recommendation first, in plain English: which side to push first, which platforms, what to spend, and what each ad should say.",
    "Customer-side ad: one strong concept as a static plus a short captioned vertical video (up to 20 seconds), sized for Meta, Instagram and TikTok, source files included.",
    "Business-side ad: one concept aimed at local business owners, same formats, source files included.",
  ],
};

const sections = project.sections;

export default function ProjectDetailPage() {
  const [activeSection, setActiveSection] = React.useState(0);
  const [bidOpen, setBidOpen] = React.useState(false);
  // Demo: flip to "client" to see the funding/approval side of escrow.
  const [viewerRole, setViewerRole] = React.useState<"client" | "freelancer">("freelancer");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Intersection observer for section tracking
  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((_, index) => {
      const el = document.getElementById(`section-${index}`);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(index);
          }
        },
        { threshold: 0.3 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  function scrollToSection(index: number) {
    const el = document.getElementById(`section-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <>
      {/* Reading Progress — flat Notion blue */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#2383e2] z-50 origin-left"
        style={{ scaleX }}
      />

      <div className="min-h-screen">
        <div className="mx-auto max-w-[900px] px-6 sm:px-10 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="ntag ntag-gray">{project.category}</span>
                  <span
                    className={cn(
                      "ntag",
                      project.status === "open" ? "ntag-green" : "ntag-gray"
                    )}
                  >
                    {PROJECT_STATUS_LABELS[project.status]?.label}
                  </span>
                  <span className="ntag ntag-yellow">Fixed price</span>
                  {/* Demo-only viewer switch — remove once auth is wired */}
                  <button
                    onClick={() =>
                      setViewerRole((r) => (r === "freelancer" ? "client" : "freelancer"))
                    }
                    className="ml-auto rounded-md border border-input bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title="Demo: switch between freelancer and client view"
                  >
                    Viewing as: {viewerRole}
                  </button>
                </div>
                <h1 className="notion-title">{project.title}</h1>
              </motion.div>

              {/* Meta Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-4 text-sm text-[rgba(55,53,47,0.65)]"
              >
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(project.budget_min)} -{" "}
                  {formatCurrency(project.budget_max)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatRelativeTime(project.created_at)}
                </span>
                {project.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {project.location}
                  </span>
                )}
                <span>{project.bid_count} proposals</span>
              </motion.div>

              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap gap-2"
              >
                {project.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </motion.div>

              <div className="notion-divider border-t" />

              {/* Sections — Notion doc body */}
              <div className="space-y-10">
                {sections.map((section, index) => (
                  <motion.section
                    key={section.title}
                    id={`section-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-[24px] font-semibold mb-3 tracking-[-0.01em] text-[rgb(55,53,47)]">
                      {section.title}
                    </h2>

                    {"paragraphs" in section && section.paragraphs && (
                      <div className="space-y-3 text-[16px] text-[rgb(55,53,47)] leading-[1.6]">
                        {section.paragraphs.map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    )}

                    {"list" in section && section.list && (
                      <ul className="space-y-2.5">
                        {section.list.map((item, i) => (
                          <li
                            key={i}
                            className="flex gap-3 text-[16px] text-[rgb(55,53,47)] leading-[1.6]"
                          >
                            <span
                              className="mt-[11px] h-[5px] w-[5px] shrink-0 rounded-full bg-[rgb(55,53,47)]"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {"outro" in section && section.outro && (
                      <p className="notion-quote font-medium text-[rgb(55,53,47)]">
                        {section.outro}
                      </p>
                    )}
                  </motion.section>
                ))}

                {/* Key Deliverables — highlighted block */}
                <motion.section
                  id="section-deliverables"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className="notion-callout flex-col gap-3 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <span aria-hidden>✅</span>
                    <h2 className="text-[16px] font-semibold text-[rgb(55,53,47)]">
                      Key Deliverables
                    </h2>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {project.keyDeliverables.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CircleCheck
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#0f7b6c]"
                          aria-hidden="true"
                        />
                        <p className="text-[15px] leading-relaxed text-[rgb(55,53,47)]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </div>

              {/* Escrow & Milestones — replaces the bottom CTA once a bid is accepted */}
              <EscrowPanel
                projectId={project.id}
                actor={viewerRole}
              />

              {/* Bottom CTA */}
              <div className="pt-2">
                <Button size="lg" className="w-full" onClick={() => setBidOpen(true)}>
                  <Send className="mr-2 h-4 w-4" />
                  Submit bid
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Sticky Card */}
              <div className="lg:sticky lg:top-4 space-y-4">
                {/* Bid Card */}
                <Card className="rounded-md" style={{ borderColor: "var(--notion-border)" }}>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Project Budget
                      </div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(project.budget_min)} -{" "}
                        {formatCurrency(project.budget_max)}
                      </div>
                    </div>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {project.bid_count} proposals
                      </div>
                      <div>•</div>
                      <div className="capitalize">{project.project_type} price</div>
                    </div>
                    <Button className="w-full" onClick={() => setBidOpen(true)}>
                      <Send className="mr-2 h-4 w-4" />
                      Submit bid
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Bookmark className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Client Card */}
                <Card className="rounded-md" style={{ borderColor: "var(--notion-border)" }}>
                  <CardHeader>
                    <CardTitle className="text-[14px] font-medium text-[rgba(55,53,47,0.65)]">About the client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {project.client.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          {project.client.name}
                          {project.client.verified && (
                            <Shield
                              className="h-4 w-4 text-[#2383e2]"
                              aria-label="Identity verified"
                            />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Member since {project.client.member_since}
                        </div>
                      </div>
                    </div>
                    {project.client.payment_verified && (
                      <div className="flex items-center gap-2 rounded-lg border border-[#0f7b6c]/25 bg-[#edf3ec] px-3 py-2 text-xs text-[#0f7b6c]">
                        <BadgeCheck className="h-4 w-4" />
                        Payment method verified · Funds held in escrow
                      </div>
                    )}
                    <Separator className="bg-border" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Jobs Posted</div>
                        <div className="font-medium">
                          {project.client.jobs_posted}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Hire Rate</div>
                        <div className="font-medium">
                          {project.client.hire_rate}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section Navigation — Notion TOC */}
                <Card className="rounded-md" style={{ borderColor: "var(--notion-border)" }}>
                  <CardContent className="p-3">
                    <div className="px-2 pb-2 text-[12px] font-semibold text-[rgba(55,53,47,0.4)]">On this page</div>
                    <nav className="space-y-px" aria-label="Project sections">
                      {sections.map((section, index) => (
                        <button
                          key={section.title}
                          onClick={() => scrollToSection(index)}
                          className={cn(
                            "block w-full truncate rounded px-2 py-1 text-left text-[13px] transition-colors",
                            activeSection === index
                              ? "bg-[rgba(55,53,47,0.08)] font-medium text-[rgb(55,53,47)]"
                              : "text-[rgba(55,53,47,0.65)] hover:bg-[rgba(55,53,47,0.06)] hover:text-[rgb(55,53,47)]"
                          )}
                        >
                          {section.title}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          document
                            .getElementById("section-deliverables")
                            ?.scrollIntoView({ behavior: "smooth", block: "start" })
                        }
                        className="block w-full truncate rounded px-2 py-1 text-left text-[13px] text-[rgba(55,53,47,0.65)] transition-colors hover:bg-[rgba(55,53,47,0.06)] hover:text-[rgb(55,53,47)]"
                      >
                        Key Deliverables
                      </button>
                    </nav>
                  </CardContent>
                </Card>

                <p className="px-1 text-xs leading-relaxed text-muted-foreground">
                  <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-[#0f7b6c]" />
                  Payments are held in escrow and released when you approve the
                  work. Bids and messages stay private to this project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SubmitBidDialog
        open={bidOpen}
        onOpenChange={setBidOpen}
        projectTitle={project.title}
        projectBudget={{ min: project.budget_min, max: project.budget_max }}
      />
    </>
  );
}
