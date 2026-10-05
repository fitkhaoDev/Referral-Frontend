import { IsoDateTime } from '@core/models/api.model';
import { Money } from '@core/models/money.model';

export type BankVerificationStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'FAILED';

export interface PartnerBankAccount {
  readonly id: string;
  readonly nickname: string;
  readonly accountHolder: string;
  readonly accountNumberLast4: string;
  readonly ifsc: string;
  readonly bankName: string;
  readonly isPrimary: boolean;
  readonly verificationStatus: BankVerificationStatus;
  readonly verifiedAt?: IsoDateTime;
  readonly verificationFailureReason?: string;
  readonly bankReturnedName?: string;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
}

export interface PartnerBankAccountList {
  readonly accounts: readonly PartnerBankAccount[];
  readonly monthlyAddEditCount: number;
  readonly monthlyAddEditLimit: number;
}

export interface AddBankAccountPayload {
  readonly nickname: string;
  readonly accountNumber: string;
  readonly confirmAccountNumber: string;
  readonly ifsc: string;
  readonly makePrimary: boolean;
  readonly currentPassword: string;
}
export type EditBankAccountPayload = AddBankAccountPayload;

export interface PartnerWalletSummary {
  readonly available: Money;
  readonly pending: Money;
  readonly heldForWithdrawal: Money;
  readonly withdrawn: Money;
  readonly feesPaid: Money;
  readonly reversed: Money;
  readonly outstandingRecovery: Money;
  readonly totalEarned: Money;
  readonly withdrawable: Money;
  readonly minWithdrawal: Money;
  readonly suspended: { reason: string; at: IsoDateTime } | null;
}

export interface WithdrawalQuote {
  readonly amount: Money;
  readonly convenienceFee: Money;
  readonly totalDebit: Money;
  readonly quoteToken: string;
  readonly quoteExpiresAt: IsoDateTime;
}

export type PartnerWithdrawalStatus =
  | 'REQUESTED'
  | 'PROCESSING'
  | 'PAID'
  | 'CANCELLED'
  | 'FAILED';

export const PARTNER_WITHDRAWAL_STATUS_LABEL: Record<PartnerWithdrawalStatus, string> = {
  REQUESTED: 'In progress',
  PROCESSING: 'In progress',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

export interface PartnerWithdrawal {
  readonly id: string;
  readonly reference: string;
  readonly status: PartnerWithdrawalStatus;
  readonly amount: Money;
  readonly convenienceCharge: Money;
  readonly totalDebit: Money;
  readonly bankSnapshot: {
    nickname: string;
    accountHolder: string;
    accountNumberLast4: string;
    ifsc: string;
    bankName: string;
  };
  readonly requestedAt: IsoDateTime;
  readonly paidAt?: IsoDateTime;
  readonly paymentReference?: string;
  readonly failedAt?: IsoDateTime;
  readonly failureReason?: string;
  readonly cancelledAt?: IsoDateTime;
}

export interface PartnerWithdrawalPage {
  readonly items: readonly PartnerWithdrawal[];
  readonly page: number;
  readonly size: number;
  readonly totalItems: number;
  readonly totalPages: number;
}
