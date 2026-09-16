"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, Star, Clock, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const TITLES: Record<string, string> = {
  client: "Client",
  freelancer: "Freelancer",
  admin: "Admin",
  dashboard: "Dashboard",
  projects: "Projects",
  new: "New",
  messages: "Messages",
  notifications: "Inbox",
  profile: "Profile",
  me: "My Profile",
  earnings: "Earnings",
  settings: "Settings",
  login: "Log in",
  register: "Sign up",
  users: "Users",
};

function segmentTitle(seg: string): string {
  if (/^\d+$/.test(seg)) return "Project"; // numeric id segment → doc-style label
  if (TITLES[seg]) return TITLES[seg];
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

export function NotionTopbar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header
      className="sticky top-0 z-30 flex h-[45px] shrink-0 items-center gap-1 px-3 backdrop-blur"
      style={{
        background: "rgba(255,255,255,0.85)",
        borderBottom: "1px solid var(--notion-border)",
      }}
      aria-label="Breadcrumb"
    >
      <button
        type="button"
        className="nitem w-7 px-1.5 md:hidden"
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="h-4 w-4" />
      </button>
      {/* Breadcrumb trail */}
      <nav className="flex min-w-0 items-center gap-0.5" aria-label="Breadcrumb">
        {segments.length === 0 ? (
          <Link href="/" className="nbcrumb hover-wash rounded px-1.5 py-0.5">
            Gigmint
          </Link>
        ) : (
          segments.map((seg, i) => {
            const href = "/" + segments.slice(0, i + 1).join("/");
            const isLast = i === segments.length - 1;
            return (
              <React.Fragment key={href}>
                {i > 0 && (
                  <span className="text-[var(--notion-text-tertiary)]" aria-hidden>
                    /
                  </span>
                )}
                <Link
                  href={href}
                  className={cn("nbcrumb hover-wash rounded px-1.5 py-0.5", isLast && "text-[var(--notion-text)]")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {segmentTitle(seg)}
                </Link>
              </React.Fragment>
            );
          })
        )}
      </nav>
      <div className="ml-auto flex items-center gap-0.5">
        <button type="button" className="nitem w-7 px-1.5" aria-label="Edited recently">
          <Clock className="h-4 w-4" />
        </button>
        <button type="button" className="nitem w-7 px-1.5" aria-label="Star">
          <Star className="h-4 w-4" />
        </button>
        <button type="button" className="nitem w-7 px-1.5" aria-label="More">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
