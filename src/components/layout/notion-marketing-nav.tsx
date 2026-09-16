"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Browse projects", href: "/projects" },
  { label: "Find talent", href: "/#freelancers" },
  { label: "How it works", href: "/#faq" },
  { label: "Pricing", href: "/#faq" },
];

export function NotionMarketingNav() {
  const [visible, setVisible] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = visible || pathname !== "/";

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: solid ? 0 : -80 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-x-0 top-0 z-50 bg-white"
        style={{ borderBottom: "1px solid var(--notion-border)" }}
      >
        <div className="mx-auto flex h-[45px] max-w-[1080px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[3px] bg-[#37352f] text-[11px] font-bold text-white">
              G
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Gigmint</span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex" aria-label="Main">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[14px] font-medium text-[rgba(55,53,47,0.78)] transition-colors hover:bg-[var(--notion-hover)] hover:text-[rgb(55,53,47)]"
              >
                {l.label}
                {l.label === "Product" && <ChevronDown className="h-3 w-3 opacity-60" />}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild className="hidden md:inline-flex">
              <Link href="/register">Get started free</Link>
            </Button>
            <button
              type="button"
              className="nitem w-8 px-1.5 md:hidden"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed inset-x-0 top-[45px] z-40 border-b bg-white md:hidden"
            style={{ borderColor: "var(--notion-border)" }}
          >
            <div className="space-y-1 px-4 py-3">
              {LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className={cn("nitem h-9")}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link href="/register">Get started free</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
