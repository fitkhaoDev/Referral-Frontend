import { createListFeature } from '@shared/store/create-list-feature';
import { PartnerType } from '../models/partner-type.model';

/** List/query state for the Partner Types admin screen. */
export const partnerTypesList = createListFeature<PartnerType>({
  name: 'adminPartnerTypes',
  selectId: (type) => type.id,
  initialSort: [{ field: 'name', direction: 'asc' }],
  initialPageSize: 10,
});

/** URL query-param keys this list reads/writes (beyond page/size/sort/q). */
export const PARTNER_TYPE_FILTER_KEYS = ['status'] as const;
