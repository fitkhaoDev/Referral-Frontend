/**
 * Live operational counts for the admin dashboard. Every value is a real count
 * returned by an existing list endpoint (`totalItems` of a `size: 1` query) — the
 * dashboard performs no aggregation of its own and never sums money client-side.
 * A field is `null` when its source call failed (e.g. the admin lacks the
 * permission); the tile then renders an em dash rather than breaking the page.
 */
export interface DashboardCounts {
  readonly partnersTotal: number | null;
  readonly partnersActive: number | null;
  readonly organisationsTotal: number | null;
  readonly organisationsActive: number | null;
  readonly organisationMembers: number | null;
  readonly referralsTotal: number | null;
  readonly commissionsPending: number | null;
  readonly commissionsAvailable: number | null;
  readonly commissionsReversed: number | null;
  readonly withdrawalsRequested: number | null;
  readonly withdrawalsProcessing: number | null;
  readonly walletsTotal: number | null;
  readonly partnerTypes: number | null;
  readonly organisationTypes: number | null;
  readonly referralEvents: number | null;
  readonly incentiveRules: number | null;
  readonly discountRules: number | null;
}
