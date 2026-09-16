"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Home,
  Inbox,
  LayoutDashboard,
  FolderKanban,
  Plus,
  FileText,
  MessageSquare,
  Bell,
  User,
  Settings,
  Wallet,
  Users,
  ClipboardList,
  ChevronDown,
  Trash2,
  LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "client" | "freelancer" | "admin";

const ROLE_WORKSPACE: Record<Role, { label: string; icon: React.ElementType; href: string }[]> = {
  client: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/client/dashboard" },
    { label: "My Projects", icon: FolderKanban, href: "/client/projects" },
    { label: "Post a Project", icon: Plus, href: "/client/projects/new" },
  ],
  freelancer: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/freelancer/dashboard" },
    { label: "Find Work", icon: FileText, href: "/projects" },
    { label: "My Applications", icon: ClipboardList, href: "/freelancer/projects" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "Users", icon: Users, href: "/admin/users" },
    { label: "Projects", icon: ClipboardList, href: "/admin/projects" },
  ],
};

const GENERAL_LINKS = [
  { label: "Messages", icon: MessageSquare, href: "/messages" },
  { label: "Inbox", icon: Bell, href: "/notifications" },
  { label: "My Profile", icon: User, href: "/profile/me" },
  { label: "Earnings", icon: Wallet, href: "/freelancer/earnings" },
  { label: "Settings", icon: Settings, href: "/freelancer/settings" },
];

function useRole(): Role {
  const pathname = usePathname();
  if (pathname.startsWith("/client")) return "client";
  if (pathname.startsWith("/admin")) return "admin";
  return "freelancer";
}

function SidebarRow({
  href,
  icon: Icon,
  label,
  active,
  trailing,
}: {
  href?: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  trailing?: React.ReactNode;
}) {
  const content = (
    <>
      <span className="nitem-icon">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="truncate">{label}</span>
      {trailing}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cn("nitem", active && "nitem-active")}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={cn("nitem w-full text-left", active && "nitem-active")}>
      {content}
    </button>
  );
}

export function NotionSidebar({ role: roleProp }: { role?: Role }) {
  const pathname = usePathname();
  const role = roleProp ?? useRole();
  const workspaceLinks = ROLE_WORKSPACE[role];

  return (
    <aside
      className="hidden md:flex w-[240px] shrink-0 flex-col justify-between border-r pt-3 pb-2 px-2 overflow-y-auto"
      style={{ background: "var(--notion-sidebar)", borderColor: "var(--notion-border)" }}
      aria-label="Workspace sidebar"
    >
      <div className="flex-1">
        {/* Workspace switcher */}
        <button
          type="button"
          className="nitem w-full h-8 px-1.5 hover:bg-[var(--notion-hover)]"
          aria-label="Switch workspace"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary text-[11px] font-bold text-primary-foreground">
            G
          </span>
          <span className="ml-1 truncate text-[14px] font-semibold">Gigmint</span>
          <ChevronDown className="ml-auto h-3.5 w-3.5" style={{ color: "var(--notion-text-tertiary)" }} />
        </button>

        {/* Quick actions */}
        <div className="mt-4 space-y-px">
          <SidebarRow icon={Search} label="Search" />
          <SidebarRow icon={Home} label="Gigmint home" href="/" active={pathname === "/"} />
          <SidebarRow icon={Inbox} label="Inbox" href="/notifications" active={pathname === "/notifications"} />
        </div>

        {/* Workspace section */}
        <div className="nsection">Workspace</div>
        <div className="space-y-px">
          {workspaceLinks.map((l) => (
            <SidebarRow key={l.href} href={l.href} icon={l.icon} label={l.label} active={pathname === l.href} />
          ))}
        </div>

        {/* General section */}
        <div className="nsection">General</div>
        <div className="space-y-px">
          {GENERAL_LINKS.map((l) => (
            <SidebarRow key={l.href} href={l.href} icon={l.icon} label={l.label} active={pathname === l.href} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-px pt-2">
        <SidebarRow icon={LayoutTemplate} label="Templates" />
        <SidebarRow icon={Trash2} label="Trash" />
        <div
          className="mt-1 flex items-center gap-2 border-t px-2 pt-2 pb-1"
          style={{ borderColor: "var(--notion-border)" }}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded bg-[#2383e2] text-[10px] font-bold text-white">
            SC
          </span>
          <span className="truncate text-[13px] font-medium">Sarah Chen</span>
          <ChevronDown className="ml-auto h-3 w-3" style={{ color: "var(--notion-text-tertiary)" }} />
        </div>
      </div>
    </aside>
  );
}
