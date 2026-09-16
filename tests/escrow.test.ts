import { describe, it, expect } from "vitest";
import {
  assertTransition,
  canTransition,
  platformFeeFor,
  netPayoutFor,
  DEFAULT_PLATFORM_FEE_BPS,
} from "../src/lib/payments/escrow";
import type { EscrowMilestone, MilestoneStatus } from "@/types";

function milestone(overrides: Partial<EscrowMilestone> = {}): EscrowMilestone {
  return {
    id: "m1",
    bid_id: "b1",
    project_id: "p1",
    title: "Milestone 1",
    amount: 10_000,
    platform_fee_bps: DEFAULT_PLATFORM_FEE_BPS,
    status: "pending_funding",
    created_at: new Date().toISOString(),
    ...overrides,
  } as EscrowMilestone;
}

describe("escrow state machine", () => {
  const FLOW: MilestoneStatus[] = [
    "pending_funding",
    "funded",
    "work_submitted",
    "approved",
    "released",
  ];

  it("allows the full happy-path flow", () => {
    for (let i = 0; i < FLOW.length - 1; i++) {
      expect(canTransition(FLOW[i], FLOW[i + 1])).toBe(true);
    }
  });

  it("rejects illegal jumps", () => {
    expect(canTransition("pending_funding", "approved")).toBe(false);
    expect(canTransition("funded", "released")).toBe(false);
    expect(canTransition("work_submitted", "pending_funding")).toBe(false);
    expect(canTransition("released", "work_submitted")).toBe(false);
  });

  it("allows dispute from any active state; disputed is terminal (refund is handled by the provider layer)", () => {
    for (const s of ["funded", "work_submitted", "approved"] as MilestoneStatus[]) {
      expect(canTransition(s, "disputed")).toBe(true);
    }
    expect(canTransition("disputed", "released")).toBe(false);
    expect(canTransition("disputed", "work_submitted")).toBe(false);
  });

  it("throws on illegal assertTransition()", () => {
    expect(() => assertTransition("funded", "released")).toThrow(/Illegal escrow transition/);
    expect(() => assertTransition("funded", "work_submitted")).not.toThrow();
  });

  it("computes fee and payout from a milestone", () => {
    const m = milestone({ amount: 10_000, platform_fee_bps: 500 });
    expect(platformFeeFor(m)).toBe(500);
    expect(netPayoutFor(m)).toBe(9_500);
    const m2 = milestone({ amount: 10_000, platform_fee_bps: 1250 });
    expect(platformFeeFor(m2)).toBe(1_250);
  });
});
