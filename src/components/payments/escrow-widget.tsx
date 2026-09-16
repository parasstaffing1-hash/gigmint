"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Landmark, Loader2, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  escrowProvider,
  computeEscrowSummary,
  MILESTONE_STATUS_LABELS,
} from "@/lib/payments/escrow";
import { formatCurrency, cn } from "@/lib/utils";
import type { EscrowMilestone } from "@/types";

type Actor = "client" | "freelancer";

interface EscrowWidgetProps {
  actor: Actor;
  /** Demo: restricts to one project's milestones until Supabase is wired. */
  projectId?: string;
}

const NEXT_ACTION: Partial<
  Record<EscrowMilestone["status"], { action: "fund" | "submit" | "approve" | "release"; label: string }>
> = {
  pending_funding: { action: "fund", label: "Fund now" },
  funded: { action: "submit", label: "Submit work" },
  work_submitted: { action: "approve", label: "Review & approve" },
  approved: { action: "release", label: "Release funds" },
};

const ACTOR_ACTIONS: Record<Actor, Array<"fund" | "submit" | "approve" | "release">> = {
  client: ["fund", "approve", "release"],
  freelancer: ["submit"],
};

export function EscrowWidget({ actor, projectId = "1" }: EscrowWidgetProps) {
  const [milestones, setMilestones] = React.useState<EscrowMilestone[] | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setMilestones(await escrowProvider.listByProject(projectId));
  }, [projectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function act(m: EscrowMilestone) {
    const next = NEXT_ACTION[m.status];
    if (!next) return;
    setBusyId(m.id);
    try {
      await escrowProvider.act(m.id, next.action);
      toast.success(`${next.label}: ${m.title}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  if (!milestones) {
    return (
      <Card className="border-border bg-secondary/50">
        <CardContent className="p-5">
          <div className="h-20 animate-pulse rounded-lg bg-secondary" />
        </CardContent>
      </Card>
    );
  }

  const summary = computeEscrowSummary(milestones);
  const actionable = milestones
    .filter((m) => {
      const next = NEXT_ACTION[m.status];
      return next && ACTOR_ACTIONS[actor].includes(next.action);
    })
    .sort((a, b) => a.created_at.localeCompare(b.created_at))[0];

  const tiles = [
    { label: "In escrow", value: formatCurrency(summary.in_escrow) },
    {
      label: actor === "client" ? "Awaiting your approval" : "Awaiting approval",
      value: formatCurrency(summary.awaiting_approval),
    },
    { label: "Released to you", value: formatCurrency(summary.total_released) },
  ];

  return (
    <Card className="border-border bg-secondary/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Landmark className="h-4 w-4 text-[#0f7b6c]" />
          Escrow
        </CardTitle>
        <Badge
          className={cn(
            summary.disputed_count > 0
              ? "bg-[#fdebec] text-[#e03e3e]"
              : "bg-[#edf3ec] text-[#0f7b6c]"
          )}
        >
          {summary.disputed_count > 0
            ? `${summary.disputed_count} disputed`
            : "All clear"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {tiles.map((t) => (
            <div
              key={t.label}
              className="rounded-lg border border-border bg-secondary/50 px-3 py-2"
            >
              <div className="truncate text-xs text-muted-foreground">{t.label}</div>
              <div className="mt-0.5 text-base font-semibold tabular-nums">
                {t.value}
              </div>
            </div>
          ))}
        </div>

        {actionable ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs text-blue-300">
                  Next up · {MILESTONE_STATUS_LABELS[actionable.status].label}
                </div>
                <div className="truncate text-sm font-medium">{actionable.title}</div>
              </div>
              <Button size="sm" disabled={busyId === actionable.id} onClick={() => act(actionable)}>
                {busyId === actionable.id ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : null}
                {NEXT_ACTION[actionable.status]!.label}
              </Button>
            </div>
          </motion.div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing needs your attention right now.
          </p>
        )}

        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link href="/projects/1">
            View milestone details
            <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
