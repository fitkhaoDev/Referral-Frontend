import { Id, IsoDateTime } from '@core/models/api.model';
import { Money } from '@core/models/money.model';
import { PartnerCategory } from '@core/models/common.model';

/**
 * A single referral EVENT occurrence, with its attribution chain and the commission
 * (if any) it generated. This is the read-only "successful conversions" view.
 *
 * The client never computes any monetary value here — `planAmount`, `customerDiscount`,
 * `amountPayable` and `commissionAmount` are all backend-provided. `commissionStatus`
 * is backend-authoritative.
 */
export interface Referral {
  readonly id: Id;
  /** Human reference, e.g. `REF-2026-004512`. */
  readonly reference: string;
  /** Masked customer identifier for display, e.g. `CUS-8842`. */
  readonly customerRef: string;

  readonly partnerCategory: PartnerCategory;
  /** Individual partner (when `partnerCategory === 'INDIVIDUAL'`). */
  readonly partnerId?: Id;
  readonly partnerName?: string;
  /** Organisation (when `partnerCategory === 'ORGANISATION'`). */
  readonly organisationId?: Id;
  readonly organisationName?: string;
  /** The referring doctor / member selected in the mandatory "Referred By" field. */
  readonly referringMemberId?: Id;
  readonly referringMemberName?: string;

  readonly referralCode: string;
  /** Referral event code (dynamic — from the Referral Events registry). */
  readonly eventCode: string;
  readonly eventName: string;

  readonly plan?: string;
  readonly planAmount?: Money;
  readonly customerDiscount?: Money;
  readonly amountPayable?: Money;

  readonly commissionAmount?: Money;
  readonly commissionStatus: ReferralCommissionStatus;

  readonly occurredAt: IsoDateTime;
  readonly transactionRef?: string;
}

export type ReferralCommissionStatus =
  | 'PENDING'
  | 'AVAILABLE'
  | 'WITHDRAWN'
  | 'REVERSED'
  | 'NONE';

export interface ReferralFilters {
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly partnerCategory?: PartnerCategory;
  readonly organisationId?: Id;
  readonly referringMemberId?: Id;
  readonly eventCode?: string;
  readonly commissionStatus?: ReferralCommissionStatus;
  readonly plan?: string;
}

export const REFERRAL_COMMISSION_STATUS_LABEL: Record<ReferralCommissionStatus, string> = {
  PENDING: 'Pending',
  AVAILABLE: 'Available',
  WITHDRAWN: 'Withdrawn',
  REVERSED: 'Reversed',
  NONE: 'No commission',
};
