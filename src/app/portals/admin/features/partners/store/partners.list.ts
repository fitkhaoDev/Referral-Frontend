import { createListFeature } from '@shared/store/create-list-feature';
import { Partner } from '../models/partner.model';

/** List/query state for the Partners admin screen. */
export const partnersList = createListFeature<Partner>({
  name: 'adminPartners',
  selectId: (partner) => partner.id,
  initialSort: [{ field: 'createdAt', direction: 'desc' }],
});

export const PARTNER_FILTER_KEYS = ['status', 'partnerTypeId', 'passwordState'] as const;
