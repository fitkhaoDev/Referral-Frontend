import { createListFeature } from '@shared/store/create-list-feature';
import { ReferralEvent } from '../models/referral-event.model';

/** List/query state for the Referral Events admin screen. */
export const referralEventsList = createListFeature<ReferralEvent>({
  name: 'adminReferralEvents',
  selectId: (event) => event.id,
  initialSort: [{ field: 'sortOrder', direction: 'asc' }],
});

export const REFERRAL_EVENT_FILTER_KEYS = ['status', 'system'] as const;
