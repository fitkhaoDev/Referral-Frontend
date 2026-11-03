import { IsoDateTime } from '@core/models/api.model';
import { Money } from '@core/models/money.model';

export type WithdrawalRequestStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface BankSnapshot {
  readonly nickname: string;
  readonly accountHolder: string;
  readonly accountNumberLast4: string;
  readonly ifsc: string;
  readonly bankName: string;
}

export interface AdminWithdrawalRequest {
  readonly id: string;
  readonly requestId: string;
  readonly ownerType: 'PARTNER' | 'ORGANISATION' | 'DOCTOR';
  readonly ownerId: string;
  readonly ownerName: string;
  readonly ownerRef: string;
  readonly bankAccountId: string;
  readonly bankSnapshot: BankSnapshot;
  readonly amount: Money;
  readonly status: WithdrawalRequestStatus;
  readonly requestedAt: IsoDateTime;
  readonly requesterNote?: string;
  readonly actionedBy?: string;
  readonly actionedAt?: IsoDateTime;
  readonly transactionId?: string;
  readonly adminComment?: string;
  readonly failureReason?: string;
}

export interface AdminWithdrawalRequestPage {
  readonly items: readonly AdminWithdrawalRequest[];
  readonly page: number;
  readonly size: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

export interface AdminWithdrawalRequestDetail extends AdminWithdrawalRequest {
  /** Partner's current default bank account (not the snapshot). May be null if deleted since. */
  readonly defaultBankAccount: {
    readonly id: string;
    readonly nickname: string;
    readonly accountHolder: string;
    /** Full decrypted account number — admin-only visibility. */
    readonly accountNumber: string | null;
    readonly accountNumberLast4: string;
    readonly ifsc: string;
    readonly bankName: string;
    readonly verificationStatus: 'VERIFIED' | 'PENDING_VERIFICATION' | 'FAILED';
    readonly isPrimary: boolean;
  } | null;
}

export interface MarkSuccessPayload {
  readonly transactionId: string;
  readonly adminComment?: string;
}

export interface MarkFailedPayload {
  readonly reason: string;
  readonly adminComment?: string;
}

export const WITHDRAWAL_REQUEST_STATUS_LABEL: Record<WithdrawalRequestStatus, string> = {
  PENDING: 'Pending',
  SUCCESS: 'Success',
  FAILED: 'Failed',
};
