import { createListFeature } from '@shared/store/create-list-feature';
import { Referral } from '../models/referral.model';

/** List/query state for the Referrals (read-only) admin screen. */
export const referralsList = createListFeature<Referral>({
  name: 'adminReferrals',
  selectId: (referral) => referral.id,
  initialSort: [{ field: 'occurredAt', direction: 'desc' }],
});

export const REFERRAL_FILTER_KEYS = [
  'fromDate',
  'toDate',
  'partnerCategory',
  'organisationId',
  'eventCode',
  'commissionStatus',
  'plan',
] as const;
