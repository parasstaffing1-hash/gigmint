"use client";

import * as React from "react";
import { NotionSidebar } from "./notion-sidebar";
import { NotionTopbar } from "./notion-topbar";
import { CommandPalette } from "./command-palette";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <NotionSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <NotionTopbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
