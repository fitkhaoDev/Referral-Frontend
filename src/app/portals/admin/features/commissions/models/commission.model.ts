import { Id, IsoDateTime } from '@core/models/api.model';
import { Money } from '@core/models/money.model';

/** Commission lifecycle. Backend-authoritative — the client never derives or changes it. */
export type CommissionStatus =
  | 'PENDING'
  | 'AVAILABLE'
  | 'WITHDRAWN'
  | 'REVERSED'
  | 'CANCELLED'
  | 'FAILED';

export const COMMISSION_STATUS_LABEL: Record<CommissionStatus, string> = {
  PENDING: 'Pending',
  AVAILABLE: 'Available',
  WITHDRAWN: 'Withdrawn',
  REVERSED: 'Reversed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

export type CommissionBeneficiaryType = 'PARTNER' | 'ORGANISATION' | 'DOCTOR';
export type IncentiveType = 'COUNSELLING' | 'FIRST_PURCHASE' | 'RENEWAL';

/**
 * The incentive rule as it stood WHEN this commission was generated. Immutable — a
 * later rule change never rewrites this. Kept for audit.
 */
export interface CommissionRuleSnapshot {
  readonly ruleId: Id;
  readonly ruleVersion: number;
  readonly incentiveType: IncentiveType;
  /** When `incentiveType === 'RENEWAL'`. */
  readonly renewalNumber?: number;
  readonly componentKind: 'PERCENT' | 'FIXED';
  /** When `componentKind === 'PERCENT'`. */
  readonly percent?: number;
  /** When `componentKind === 'FIXED'`. */
  readonly fixedAmount?: Money;
  /** The amount the backend applied the rule to (the commission base it chose). */
  readonly eligibleAmount?: Money;
  readonly snapshotAt: IsoDateTime;
}

/**
 * A commission generated for a referral event. Every monetary value and the status
 * are backend-computed; `ruleSnapshot` preserves the exact rule + values used.
 */
export interface Commission {
  readonly id: Id;
  readonly reference: string;
  readonly beneficiaryType: CommissionBeneficiaryType;
  readonly partnerId?: Id;
  readonly partnerName?: string;
  readonly organisationId?: Id;
  readonly organisationName?: string;
  readonly memberId?: Id;
  readonly memberName?: string;

  readonly customerRef: string;
  readonly referralCode: string;
  readonly eventCode: string;
  readonly eventName: string;

  /** The commission amount (backend-computed). */
  readonly calculatedAmount: Money;
  readonly status: CommissionStatus;
  readonly ruleSnapshot: CommissionRuleSnapshot;

  readonly transactionRef?: string;
  readonly occurredAt: IsoDateTime;
  readonly availableAt?: IsoDateTime;
  readonly reversedAt?: IsoDateTime;
  readonly reversalReason?: string;
}

export interface CommissionFilters {
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly status?: CommissionStatus;
  readonly beneficiaryType?: CommissionBeneficiaryType;
  readonly incentiveType?: IncentiveType;
  readonly organisationId?: Id;
  readonly eventCode?: string;
}

export const INCENTIVE_TYPE_LABEL: Record<IncentiveType, string> = {
  COUNSELLING: 'Counselling',
  FIRST_PURCHASE: 'First purchase',
  RENEWAL: 'Renewal',
};
