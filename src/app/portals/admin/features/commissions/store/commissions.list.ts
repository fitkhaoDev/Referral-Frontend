import { createListFeature } from '@shared/store/create-list-feature';
import { Commission } from '../models/commission.model';

/** List/query state for the Commissions (read-only) admin screen. */
export const commissionsList = createListFeature<Commission>({
  name: 'adminCommissions',
  selectId: (commission) => commission.id,
  initialPageSize: 10,
  initialSort: [{ field: 'occurredAt', direction: 'desc' }],
});

export const COMMISSION_FILTER_KEYS = [
  'fromDate',
  'toDate',
  'status',
  'beneficiaryType',
  'incentiveType',
  'organisationId',
  'eventCode',
] as const;
