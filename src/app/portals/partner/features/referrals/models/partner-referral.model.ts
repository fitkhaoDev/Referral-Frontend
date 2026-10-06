import { IsoDateTime } from '@core/models/api.model';
import { Money } from '@core/models/money.model';

export type PartnerReferralCommissionStatus =
  | 'PENDING'
  | 'AVAILABLE'
  | 'WITHDRAWN'
  | 'REVERSED'
  | 'NONE';

export interface PartnerReferralRow {
  readonly id: string;
  readonly reference: string;
  readonly customerName: string;
  readonly customerMobile: string;
  readonly referralCode: string;
  readonly plan: string;
  readonly planAmount?: Money;
  readonly customerDiscount?: Money;
  readonly amountPayable?: Money;
  readonly commissionAmount?: Money;
  readonly commissionStatus: PartnerReferralCommissionStatus;
  readonly occurredAt: IsoDateTime;
}

export interface PartnerReferralPage {
  readonly items: readonly PartnerReferralRow[];
  readonly page: number;
  readonly size: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

export interface PartnerReferralFilters {
  readonly search?: string;
  readonly commissionStatus?: PartnerReferralCommissionStatus;
  readonly fromDate?: string;
  readonly toDate?: string;
}

export const PARTNER_REFERRAL_COMMISSION_STATUS_LABEL: Record<
  PartnerReferralCommissionStatus,
  string
> = {
  PENDING: 'Pending',
  AVAILABLE: 'Available',
  WITHDRAWN: 'Withdrawn',
  REVERSED: 'Reversed',
  NONE: 'No commission',
};
