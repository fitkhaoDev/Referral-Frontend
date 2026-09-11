import { Id, IsoDateTime } from '@core/models/api.model';
import { Money } from '@core/models/money.model';

/**
 * Withdrawal lifecycle. The backend owns every transition — the client only renders
 * the current status and the actions the backend says are currently permitted (see
 * {@link Withdrawal.allowedActions}). It never infers a transition graph itself.
 */
export type WithdrawalStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REJECTED'
  | 'CANCELLED';

export const WITHDRAWAL_STATUS_LABEL: Record<WithdrawalStatus, string> = {
  REQUESTED: 'Requested',
  APPROVED: 'Approved',
  PROCESSING: 'Processing',
  PAID: 'Paid',
  FAILED: 'Failed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export type WithdrawalBeneficiaryType = 'PARTNER' | 'ORGANISATION' | 'DOCTOR';

export const WITHDRAWAL_BENEFICIARY_TYPE_LABEL: Record<WithdrawalBeneficiaryType, string> = {
  PARTNER: 'Partner',
  ORGANISATION: 'Organisation',
  DOCTOR: 'Doctor',
};

export type WithdrawalPayoutMethod = 'BANK_TRANSFER' | 'UPI';

export const WITHDRAWAL_PAYOUT_METHOD_LABEL: Record<WithdrawalPayoutMethod, string> = {
  BANK_TRANSFER: 'Bank transfer',
  UPI: 'UPI',
};

/**
 * An action an admin can take on a withdrawal. The set that applies to a given
 * withdrawal RIGHT NOW is returned by the backend on `Withdrawal.allowedActions` —
 * do not derive it from `status` on the client.
 */
export type WithdrawalAction =
  | 'APPROVE'
  | 'REJECT'
  | 'MARK_PROCESSING'
  | 'MARK_PAID'
  | 'MARK_FAILED';

export const WITHDRAWAL_ACTION_LABEL: Record<WithdrawalAction, string> = {
  APPROVE: 'Approve',
  REJECT: 'Reject',
  MARK_PROCESSING: 'Move to processing',
  MARK_PAID: 'Mark as paid',
  MARK_FAILED: 'Mark as failed',
};

export interface Withdrawal {
  readonly id: Id;
  readonly reference: string;
  readonly beneficiaryType: WithdrawalBeneficiaryType;
  readonly partnerId?: Id;
  readonly partnerName?: string;
  readonly organisationId?: Id;
  readonly organisationName?: string;
  readonly memberId?: Id;
  readonly memberName?: string;
  readonly walletId: Id;

  /** Amount the beneficiary asked to withdraw. Backend-set. */
  readonly amount: Money;
  /**
   * The beneficiary's available balance at the moment the request was made, as
   * recorded by the backend. Shown for context only — never recomputed here.
   */
  readonly availableBalanceAtRequest: Money;

  readonly status: WithdrawalStatus;
  /** Actions the admin may take now. Authoritative — comes from the backend. */
  readonly allowedActions: readonly WithdrawalAction[];

  readonly payoutMethod: WithdrawalPayoutMethod;
  /** Already masked by the backend, e.g. `HDFC ••••4821` or `ritu@okhdfcbank`. */
  readonly payoutDestination: string;

  readonly requestedAt: IsoDateTime;
  readonly decidedAt?: IsoDateTime;
  readonly decidedBy?: string;
  readonly rejectionReason?: string;
  readonly processingStartedAt?: IsoDateTime;
  readonly paidAt?: IsoDateTime;
  /** Bank UTR / UPI transaction reference recorded when marked paid. */
  readonly paymentReference?: string;
  readonly failedAt?: IsoDateTime;
  readonly failureReason?: string;
  readonly cancelledAt?: IsoDateTime;

  /** Free-text note the beneficiary attached to the request, if any. */
  readonly requesterNote?: string;
}

/**
 * Withdrawal rules. Backend-provided — NEVER hardcode these thresholds in the UI.
 * Fetched once from `GET /api/admin/withdrawals/policy` and shown as context.
 */
export interface WithdrawalPolicy {
  readonly minAmount: Money;
  readonly maxRequestsPerCalendarMonth: number;
  readonly currency: string;
  /** Optional human note the backend may return for display. */
  readonly note?: string;
}

export interface WithdrawalFilters {
  readonly status?: WithdrawalStatus;
  readonly beneficiaryType?: WithdrawalBeneficiaryType;
  readonly organisationId?: Id;
  readonly fromDate?: string;
  readonly toDate?: string;
}

export interface RejectWithdrawalPayload {
  readonly reason: string;
}
export interface MarkWithdrawalPaidPayload {
  readonly paymentReference: string;
}
export interface MarkWithdrawalFailedPayload {
  readonly reason: string;
}
