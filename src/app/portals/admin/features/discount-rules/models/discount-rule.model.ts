import { Id, IsoDate, IsoDateTime } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import { Money } from '@core/models/money.model';
import { RuleScopeType } from '@core/models/rule-scope.model';

export type DiscountKind = 'NONE' | 'PERCENT' | 'FIXED';

/**
 * The customer discount a rule grants. Completely separate from partner incentives.
 * `percent` is a whole/decimal percentage (e.g. `10` = 10%). The client never
 * computes an applied discount amount — this is only the rule definition.
 */
export interface DiscountValue {
  readonly kind: DiscountKind;
  /** When `kind === 'PERCENT'`. */
  readonly percent?: number;
  /** When `kind === 'FIXED'`. */
  readonly amount?: Money;
  /** Optional cap when `kind === 'PERCENT'`. */
  readonly maxAmount?: Money;
}

/**
 * A customer-discount rule. Editing it creates a NEW version on the backend;
 * discounts already applied to existing customers are unaffected (a customer can
 * use a referral discount only once in their lifetime — backend-enforced).
 */
export interface DiscountRule {
  readonly id: Id;
  readonly name: string;
  readonly scopeType: RuleScopeType;
  readonly scopeId?: Id;
  readonly scopeLabel: string;
  readonly discount: DiscountValue;
  readonly status: EntityStatus;
  readonly effectiveFrom: IsoDate;
  /** Read-only. Bumped by the backend on every change; commission/discount snapshots reference it. */
  readonly version: number;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
}

export interface CreateDiscountRulePayload {
  readonly name: string;
  readonly scopeType: RuleScopeType;
  readonly scopeId?: Id;
  readonly discount: DiscountValue;
  readonly status: EntityStatus;
  readonly effectiveFrom: IsoDate;
}

/** Full replace; the backend bumps `version`. */
export type UpdateDiscountRulePayload = CreateDiscountRulePayload;

export interface DiscountRuleFilters {
  readonly scopeType?: RuleScopeType;
  readonly status?: EntityStatus;
}

export const DISCOUNT_KIND_LABEL: Record<DiscountKind, string> = {
  NONE: 'No discount',
  PERCENT: 'Percentage',
  FIXED: 'Fixed amount',
};
