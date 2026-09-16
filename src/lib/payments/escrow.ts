import type {
  EscrowMilestone,
  EscrowSummary,
  MilestoneStatus,
} from "@/types";

// ---------------------------------------------------------------------------
// Escrow engine — mock provider
//
// State machine:
//   pending_funding → funded → work_submitted → approved → released
//                                     └──────────────────→ disputed
//
// All transitions are guarded and throw on illegal moves, mirroring what a
// server-side Stripe implementation would enforce server-side. Swap the
// `escrowProvider` functions for real Stripe API calls (PaymentIntents with
// manual capture, or separate charges per milestone) without touching the UI.
// ---------------------------------------------------------------------------

export const DEFAULT_PLATFORM_FEE_BPS = 500; // 5%

/** Legal transitions: from → allowed next statuses. */
const TRANSITIONS: Record<MilestoneStatus, MilestoneStatus[]> = {
  pending_funding: ["funded"],
  funded: ["work_submitted", "disputed"],
  work_submitted: ["approved", "disputed"],
  approved: ["released", "disputed"],
  released: [],
  disputed: [],
};

export const MILESTONE_STATUS_LABELS: Record<
  MilestoneStatus,
  { label: string; className: string }
> = {
  pending_funding: {
    label: "Awaiting funding",
    className: "bg-amber-500/15 text-amber-300",
  },
  funded: {
    label: "Funded · in escrow",
    className: "bg-blue-500/15 text-blue-300",
  },
  work_submitted: {
    label: "Work submitted",
    className: "bg-purple-500/15 text-purple-300",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/15 text-emerald-300",
  },
  released: {
    label: "Released",
    className: "bg-emerald-500/15 text-emerald-300",
  },
  disputed: {
    label: "Disputed",
    className: "bg-red-500/15 text-red-300",
  },
};

// ---------------------------------------------------------------------------
// Pure state-machine helpers (used by both UI and future API routes)
// ---------------------------------------------------------------------------

export function assertTransition(from: MilestoneStatus, to: MilestoneStatus) {
  if (!TRANSITIONS[from].includes(to)) {
    throw new Error(
      `Illegal escrow transition: "${from}" → "${to}". Allowed: ${TRANSITIONS[from].join(", ") || "none"}.`
    );
  }
}

export function canTransition(from: MilestoneStatus, to: MilestoneStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function platformFeeFor(milestone: EscrowMilestone): number {
  return Math.round(milestone.amount * (milestone.platform_fee_bps / 10_000));
}

export function netPayoutFor(milestone: EscrowMilestone): number {
  return milestone.amount - platformFeeFor(milestone);
}

/** Sums milestones into an at-a-glance escrow summary. */
export function computeEscrowSummary(milestones: EscrowMilestone[]): EscrowSummary {
  let total_funded = 0;
  let total_released = 0;
  let in_escrow = 0;
  let awaiting_approval = 0;
  let disputed_count = 0;

  for (const m of milestones) {
    if (m.status !== "pending_funding") total_funded += m.amount;
    if (m.status === "released") total_released += m.amount;
    if (m.status === "funded") in_escrow += m.amount;
    if (m.status === "work_submitted") awaiting_approval += m.amount;
    if (m.status === "disputed") disputed_count += 1;
  }

  return { total_funded, total_released, in_escrow, awaiting_approval, disputed_count };
}

// ---------------------------------------------------------------------------
// Mock store — replace with Supabase (`escrow_milestones` table) + Stripe
// ---------------------------------------------------------------------------

const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 11);

function makeMilestone(
  partial: Pick<EscrowMilestone, "bid_id" | "project_id" | "title" | "amount"> &
    Partial<
      Pick<
        EscrowMilestone,
        "description" | "status" | "funded_at" | "submitted_at" | "approved_at"
      >
    >
): EscrowMilestone {
  return {
    id: uid(),
    description: null,
    status: "pending_funding",
    platform_fee_bps: DEFAULT_PLATFORM_FEE_BPS,
    funded_at: null,
    submitted_at: null,
    approved_at: null,
    created_at: now(),
    updated_at: now(),
    ...partial,
  };
}

/** Demo data shaped like the accepted-bid milestones for project #1. */
export const mockMilestones: EscrowMilestone[] = [
  makeMilestone({
    bid_id: "bid-1",
    project_id: "1",
    title: "Design system & dashboard shell",
    description:
      "Layout primitives, navigation, theming, and the component library skeleton.",
    amount: 3000,
    status: "funded",
    funded_at: "2026-09-12T10:00:00Z",
  }),
  makeMilestone({
    bid_id: "bid-1",
    project_id: "1",
    title: "Real-time analytics widgets",
    description: "WebSocket streaming, D3 charts, drag-and-drop grid.",
    amount: 3500,
    status: "work_submitted",
    submitted_at: "2026-09-14T16:30:00Z",
  }),
  makeMilestone({
    bid_id: "bid-1",
    project_id: "1",
    title: "Hardening, tests & handover",
    description: "Test suite, deployment guide, handover session.",
    amount: 2500,
    status: "pending_funding",
  }),
];

const ACTION_TARGET: Record<TransitionAction, MilestoneStatus> = {
  fund: "funded",
  submit: "work_submitted",
  approve: "approved",
  release: "released",
  dispute: "disputed",
};

/** Who performs each action — used to decide which buttons to render. */
export const ACTION_ACTOR: Record<TransitionAction, "client" | "freelancer"> = {
  fund: "client",
  submit: "freelancer",
  approve: "client",
  release: "client",
  dispute: "client",
};

/** Source status each action starts from. */
const ACTION_FROM: Record<TransitionAction, MilestoneStatus> = {
  fund: "pending_funding",
  submit: "funded",
  approve: "work_submitted",
  release: "approved",
  dispute: "funded",
};

export type TransitionAction =
  | "fund"
  | "submit"
  | "approve"
  | "release"
  | "dispute";

export interface EscrowProvider {
  listByProject(projectId: string): Promise<EscrowMilestone[]>;
  act(
    milestoneId: string,
    action: TransitionAction
  ): Promise<EscrowMilestone>;
}

export const escrowProvider: EscrowProvider = {
  async listByProject(projectId) {
    await sleep(150);
    return mockMilestones.filter((m) => m.project_id === projectId);
  },

  async act(milestoneId, action) {
    await sleep(250);
    const milestone = mockMilestones.find((m) => m.id === milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    const from = ACTION_FROM[action];
    const to = ACTION_TARGET[action];
    if (milestone.status !== from) {
      throw new Error(
        `Cannot ${action}: milestone is "${milestone.status}", expected "${from}".`
      );
    }
    assertTransition(from, to);

    milestone.status = to;
    milestone.updated_at = now();
    if (action === "fund") milestone.funded_at = now();
    if (action === "submit") milestone.submitted_at = now();
    if (action === "approve") milestone.approved_at = now();
    if (action === "release") milestone.approved_at = milestone.approved_at ?? now();

    // TODO: also insert into `escrow_transactions` and call Stripe here.
    return milestone;
  },
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
