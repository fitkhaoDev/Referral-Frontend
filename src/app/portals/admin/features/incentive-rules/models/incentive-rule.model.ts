import { Id, IsoDate, IsoDateTime } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import { Money } from '@core/models/money.model';
import { RuleScopeType } from '@core/models/rule-scope.model';

/** Who earns the incentive. Organisation and doctor incentives are INDEPENDENT rules. */
export type IncentiveBeneficiary = 'PARTNER' | 'ORGANISATION' | 'ORGANISATION + CONSULTER';

export const INCENTIVE_BENEFICIARY_LABEL: Record<IncentiveBeneficiary, string> = {
  'PARTNER': 'Individual partner',
  'ORGANISATION': 'Organisation',
  'ORGANISATION + CONSULTER': 'Organisation with Consulter',
};

export type IncentiveComponentKind = 'NONE' | 'PERCENT' | 'FIXED';

/**
 * A single incentive value. `percent` is a whole/decimal percentage (e.g. `5` = 5%).
 * The client NEVER computes a commission from this — the backend does, and snapshots
 * the resolved rule + values onto each commission.
 */
export interface IncentiveComponent {
  readonly kind: IncentiveComponentKind;
  readonly percent?: number;
  readonly amount?: Money;
}

export type RenewalIncentiveKind =
  | 'NONE'
  | 'PERCENT_INDEFINITE'
  | 'FIXED_INDEFINITE'
  | 'PER_RENEWAL';

export interface RenewalTier {
  /** 1-based renewal number this tier applies to. */
  readonly renewalNumber: number;
  readonly incentive: IncentiveComponent;
}

/**
 * Renewal incentive structure. Supports: none · same % indefinitely · same fixed
 * indefinitely · a distinct incentive per renewal number (`tiers`), with
 * `beyondLastTier` covering every renewal after the last listed tier.
 */
export interface RenewalIncentive {
  readonly kind: RenewalIncentiveKind;
  /** `PERCENT_INDEFINITE`. */
  readonly percent?: number;
  /** `FIXED_INDEFINITE`. */
  readonly amount?: Money;
  /** `PER_RENEWAL` — ordered from renewal #1. */
  readonly tiers?: readonly RenewalTier[];
  /** `PER_RENEWAL` — applies to renewal #(tiers.length + 1) onward. Defaults to NONE. */
  readonly beyondLastTier?: IncentiveComponent;
}

/**
 * A partner/organisation/doctor incentive rule. Editing creates a NEW version on the
 * backend; historical commissions keep their snapshot and are never recalculated.
 *
 * The commission base (gross / discounted / net amount) is a backend business
 * decision and is NOT part of this rule.
 */
export interface IncentiveRule {
  readonly id: Id;
  readonly name: string;
  readonly scopeType: RuleScopeType;
  readonly scopeId?: Id;
  readonly scopeLabel: string;
  readonly beneficiary: IncentiveBeneficiary;
  readonly counselling: IncentiveComponent;
  readonly firstPurchase: IncentiveComponent;
  readonly renewal: RenewalIncentive;
  /** Present only when beneficiary is ORGANISATION + CONSULTER. */
  readonly consulterCounselling?: IncentiveComponent;
  readonly consulterFirstPurchase?: IncentiveComponent;
  readonly consulterRenewal?: RenewalIncentive;
  readonly status: EntityStatus;
  readonly effectiveFrom: IsoDate;
  /** Read-only. Bumped by the backend on every change; commission snapshots reference it. */
  readonly version: number;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
}

export interface CreateIncentiveRulePayload {
  readonly name: string;
  readonly scopeType: RuleScopeType;
  readonly scopeId?: Id;
  readonly beneficiary: IncentiveBeneficiary;
  readonly counselling: IncentiveComponent;
  readonly firstPurchase: IncentiveComponent;
  readonly renewal: RenewalIncentive;
  /** Present only when beneficiary is ORGANISATION + CONSULTER. */
  readonly consulterCounselling?: IncentiveComponent;
  readonly consulterFirstPurchase?: IncentiveComponent;
  readonly consulterRenewal?: RenewalIncentive;
  readonly status: EntityStatus;
  readonly effectiveFrom: IsoDate;
}

export type UpdateIncentiveRulePayload = CreateIncentiveRulePayload;

export interface IncentiveRuleFilters {
  readonly scopeType?: RuleScopeType;
  readonly beneficiary?: IncentiveBeneficiary;
  readonly status?: EntityStatus;
}

export const INCENTIVE_COMPONENT_KIND_LABEL: Record<IncentiveComponentKind, string> = {
  NONE: 'No incentive',
  PERCENT: 'Percentage',
  FIXED: 'Fixed amount',
};

export const RENEWAL_INCENTIVE_KIND_LABEL: Record<RenewalIncentiveKind, string> = {
  NONE: 'No renewal incentive',
  PERCENT_INDEFINITE: 'Same percentage, every renewal',
  FIXED_INDEFINITE: 'Same fixed amount, every renewal',
  PER_RENEWAL: 'Different per renewal number',
};
