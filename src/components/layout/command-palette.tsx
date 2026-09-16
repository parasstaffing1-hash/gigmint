"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  Bell,
  User,
  Plus,
  FileText,
  Settings,
  Home,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";

interface PaletteItem {
  label: string;
  hint?: string;
  icon: React.ElementType;
  action: () => void;
  keywords?: string;
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = React.useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const groups: { heading: string; items: PaletteItem[] }[] = [
    {
      heading: "Navigation",
      items: [
        { label: "Home", icon: Home, action: () => go("/"), keywords: "landing landing page" },
        { label: "Dashboard", icon: LayoutDashboard, action: () => go("/freelancer/dashboard"), keywords: "overview stats" },
        { label: "Browse Projects", icon: Search, action: () => go("/projects"), keywords: "find work jobs feed" },
        { label: "Messages", icon: MessageSquare, action: () => go("/messages"), keywords: "chat inbox" },
        { label: "Notifications", icon: Bell, action: () => go("/notifications"), keywords: "alerts inbox" },
        { label: "My Profile", icon: User, action: () => go("/profile/me"), keywords: "account bio" },
        { label: "Settings", icon: Settings, action: () => go("/freelancer/settings"), keywords: "preferences" },
      ],
    },
    {
      heading: "Actions",
      items: [
        { label: "Post a Project", icon: Plus, action: () => go("/client/projects/new"), keywords: "create new hire" },
        { label: "Submit a Bid", icon: FileText, action: () => go("/projects"), keywords: "apply proposal" },
        { label: "Log out", icon: LogOut, action: () => logoutAction() },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(15,15,15,0.3)] backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[15%] z-50 w-[min(560px,92vw)] -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-[rgba(15,15,15,0.1)_0px_10px_40px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <Command label="Command palette" className="flex flex-col">
            <div
              className="flex items-center gap-2.5 border-b px-4"
              style={{ borderColor: "var(--notion-border)" }}
            >
              <Search className="h-4 w-4 shrink-0 text-[rgba(55,53,47,0.4)]" />
              <Command.Input
                autoFocus
                placeholder="Search commands and pages…"
                className="h-11 w-full bg-transparent text-[14px] text-[rgb(55,53,47)] outline-none placeholder:text-[rgba(55,53,47,0.4)]"
              />
              <kbd className="rounded border px-1.5 py-0.5 text-[10px] text-[rgba(55,53,47,0.4)]" style={{ borderColor: "var(--notion-border)" }}>
                ESC
              </kbd>
            </div>
            <Command.List className="max-h-[320px] overflow-y-auto p-1.5">
              <Command.Empty className="py-8 text-center text-sm text-[rgba(55,53,47,0.5)]">
                No results found.
              </Command.Empty>
              {groups.map((group) => (
                <Command.Group
                  key={group.heading}
                  heading={group.heading}
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[rgba(55,53,47,0.4)]"
                >
                  {group.items.map((item) => (
                    <Command.Item
                      key={item.label}
                      value={`${item.label} ${item.keywords ?? ""}`}
                      onSelect={item.action}
                      className="flex cursor-pointer items-center gap-2.5 rounded-[4px] px-2 py-2 text-[14px] text-[rgb(55,53,47)] data-[selected=true]:bg-[rgba(55,53,47,0.06)]"
                    >
                      <item.icon className="h-4 w-4 text-[rgba(55,53,47,0.55)]" />
                      {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
