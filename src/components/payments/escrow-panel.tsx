"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  ShieldCheck,
  Loader2,
  CircleCheck,
  Clock,
  FileUp,
  Scale,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  escrowProvider,
  computeEscrowSummary,
  MILESTONE_STATUS_LABELS,
  netPayoutFor,
  type TransitionAction,
} from "@/lib/payments/escrow";
import { formatCurrency } from "@/lib/utils";
import type { EscrowMilestone } from "@/types";
import { cn } from "@/lib/utils";

type Actor = "client" | "freelancer";

interface EscrowPanelProps {
  projectId: string;
  /** Who is viewing — decides which actions are available. */
  actor: Actor;
  className?: string;
}

const NEXT_ACTION_BY_STATUS: Partial<
  Record<EscrowMilestone["status"], { action: TransitionAction; label: string; icon: React.ElementType }>
> = {
  pending_funding: { action: "fund", label: "Fund milestone", icon: Landmark },
  funded: { action: "submit", label: "Submit work", icon: FileUp },
  work_submitted: { action: "approve", label: "Approve work", icon: CircleCheck },
  approved: { action: "release", label: "Release funds", icon: ShieldCheck },
};

export function EscrowPanel({ projectId, actor, className }: EscrowPanelProps) {
  const [milestones, setMilestones] = React.useState<EscrowMilestone[] | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const rows = await escrowProvider.listByProject(projectId);
    setMilestones(rows);
  }, [projectId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function runAction(milestone: EscrowMilestone, action: TransitionAction) {
    setBusyId(milestone.id);
    try {
      await escrowProvider.act(milestone.id, action);
      toast.success(
        action === "fund" && "Funds placed in escrow" ||
          action === "submit" && "Work submitted for approval" ||
          action === "approve" && "Work approved — ready to release" ||
          action === "release" && "Funds released to freelancer" ||
          "Milestone disputed — our team will review",
        { description: milestone.title }
      );
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  if (!milestones) {
    return (
      <Card className={cn("border-border bg-secondary/50", className)}>
        <CardContent className="p-6 space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-secondary" />
          <div className="h-16 animate-pulse rounded-lg bg-secondary" />
          <div className="h-16 animate-pulse rounded-lg bg-secondary" />
        </CardContent>
      </Card>
    );
  }

  const summary = computeEscrowSummary(milestones);
  const isClient = actor === "client";

  return (
    <Card className={cn("border-border bg-secondary/50", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Landmark className="h-4 w-4 text-[#0f7b6c]" />
          Escrow &amp; Milestones
        </CardTitle>
        <Badge className="bg-[#edf3ec] text-[#0f7b6c]">
          <ShieldCheck className="mr-1 h-3 w-3" />
          Protected
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryStat
            label={isClient ? "In escrow" : "Funded"}
            value={formatCurrency(summary.in_escrow)}
          />
          <SummaryStat
            label="Awaiting approval"
            value={formatCurrency(summary.awaiting_approval)}
          />
          <SummaryStat
            label="Released"
            value={formatCurrency(summary.total_released)}
          />
          <SummaryStat
            label="Disputed"
            value={String(summary.disputed_count)}
            danger={summary.disputed_count > 0}
          />
        </div>

        <Separator className="bg-border" />

        {/* Milestone timeline */}
        {milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Milestones appear here once a bid is accepted and its payment plan
            is confirmed.
          </p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-5">
            {milestones.map((m, i) => {
              const status = MILESTONE_STATUS_LABELS[m.status];
              const next = NEXT_ACTION_BY_STATUS[m.status];
              const actorCanAct =
                next &&
                ((isClient && (next.action === "fund" || next.action === "approve" || next.action === "release")) ||
                  (!isClient && next.action === "submit"));
              const busy = busyId === m.id;

              return (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="relative rounded-xl border border-border bg-secondary/50 p-4"
                >
                  <span
                    className="absolute -left-[27px] top-5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-background bg-primary"
                    aria-hidden="true"
                  />
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Milestone {i + 1}
                        </span>
                        <Badge className={status.className}>{status.label}</Badge>
                      </div>
                      <h4 className="mt-1 font-medium leading-snug">{m.title}</h4>
                      {m.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {m.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold tabular-nums">
                        {formatCurrency(m.amount)}
                      </div>
                      {m.status !== "released" && (
                        <div className="text-xs text-muted-foreground">
                          net {formatCurrency(netPayoutFor(m))} after{" "}
                          {m.platform_fee_bps / 100}% fee
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {actorCanAct && next && (
                      <Button
                        size="sm"
                        variant={next.action === "release" || next.action === "approve" ? "gold" : "outline"}
                        disabled={busy}
                        onClick={() => runAction(m, next.action)}
                      >
                        {busy ? (
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <next.icon className="mr-2 h-3.5 w-3.5" />
                        )}
                        {next.label}
                      </Button>
                    )}
                    {!isClient && m.status === "work_submitted" && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Waiting for client approval
                      </span>
                    )}
                    {canDispute(m.status) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
                        disabled={busy}
                        onClick={() => runAction(m, "dispute")}
                      >
                        <Scale className="mr-2 h-3.5 w-3.5" />
                        Dispute
                      </Button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}

        <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2383e2]" />
          {isClient
            ? "Funds stay in escrow until you approve each milestone. Release only after you're satisfied — disputes freeze the funds for review."
            : "Clients fund each milestone up front. Once you submit work and they approve, funds release to you minus the platform fee."}
        </div>
      </CardContent>
    </Card>
  );
}

function canDispute(status: EscrowMilestone["status"]): boolean {
  return status === "funded" || status === "work_submitted" || status === "approved";
}

function SummaryStat({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-lg font-semibold tabular-nums",
          danger && "text-red-300"
        )}
      >
        {value}
      </div>
    </div>
  );
}
