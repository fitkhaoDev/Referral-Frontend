import { Id, IsoDateTime } from '@core/models/api.model';
import { Money } from '@core/models/money.model';

export type WalletOwnerType = 'PARTNER' | 'ORGANISATION' | 'DOCTOR';

/**
 * A wallet's balances. ALL figures are backend-provided — the client never sums the
 * ledger to derive them (the spec forbids treating the wallet as a running number).
 */
export interface WalletSummary {
  readonly id: Id;
  readonly ownerType: WalletOwnerType;
  readonly ownerId: Id;
  readonly ownerName: string;
  /** Partner ID / Organisation Partner ID for display. */
  readonly ownerRef: string;
  readonly currency: string;
  readonly totalEarned: Money;
  readonly available: Money;
  readonly pending: Money;
  readonly withdrawn: Money;
  readonly reversed: Money;
  /** Outstanding amount to be recovered from future incentives. */
  readonly outstandingRecovery: Money;
  readonly lastActivityAt: IsoDateTime;
}

export type WalletTransactionType =
  | 'COUNSELLING_INCENTIVE'
  | 'FIRST_PURCHASE_INCENTIVE'
  | 'RENEWAL_INCENTIVE'
  | 'WITHDRAWAL'
  | 'REVERSAL'
  | 'RECOVERY'
  | 'ADJUSTMENT';

export type WalletTransactionStatus =
  | 'PENDING'
  | 'AVAILABLE'
  | 'PAID'
  | 'RECOVERED'
  | 'REVERSED';

/**
 * One ledger entry. `amount` is always positive; `direction` gives the sign. A
 * reversal is a SEPARATE debit row — the original credit row is never modified.
 */
export interface WalletTransaction {
  readonly id: Id;
  readonly reference: string;
  readonly type: WalletTransactionType;
  readonly direction: 'CREDIT' | 'DEBIT';
  readonly amount: Money;
  readonly status: WalletTransactionStatus;
  readonly customerRef?: string;
  readonly organisationName?: string;
  readonly memberName?: string;
  readonly eventName?: string;
  /** e.g. `"5%"` or `"₹100"`. */
  readonly incentiveRate?: string;
  readonly eligibleAmount?: Money;
  readonly commissionId?: Id;
  readonly commissionRef?: string;
  readonly note?: string;
  readonly occurredAt: IsoDateTime;
}

export interface WalletSummaryFilters {
  readonly ownerType?: WalletOwnerType;
}

export interface WalletTransactionFilters {
  readonly type?: WalletTransactionType;
  readonly status?: WalletTransactionStatus;
  readonly fromDate?: string;
  readonly toDate?: string;
}

export const WALLET_TRANSACTION_TYPE_LABEL: Record<WalletTransactionType, string> = {
  COUNSELLING_INCENTIVE: 'Counselling incentive',
  FIRST_PURCHASE_INCENTIVE: 'First purchase incentive',
  RENEWAL_INCENTIVE: 'Renewal incentive',
  WITHDRAWAL: 'Withdrawal',
  REVERSAL: 'Commission reversal',
  RECOVERY: 'Previous commission recovery',
  ADJUSTMENT: 'Adjustment',
};

export const WALLET_TRANSACTION_STATUS_LABEL: Record<WalletTransactionStatus, string> = {
  PENDING: 'Pending',
  AVAILABLE: 'Available',
  PAID: 'Paid',
  RECOVERED: 'Recovered',
  REVERSED: 'Reversed',
};

export const WALLET_OWNER_TYPE_LABEL: Record<WalletOwnerType, string> = {
  PARTNER: 'Partner',
  ORGANISATION: 'Organisation',
  DOCTOR: 'Doctor',
};
