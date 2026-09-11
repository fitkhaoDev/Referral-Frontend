import { createListFeature } from '@shared/store/create-list-feature';
import { Withdrawal } from '../models/withdrawal.model';

/** List/query state for the Withdrawals admin screen. */
export const withdrawalsList = createListFeature<Withdrawal>({
  name: 'adminWithdrawals',
  selectId: (withdrawal) => withdrawal.id,
  initialSort: [{ field: 'requestedAt', direction: 'desc' }],
});

export const WITHDRAWAL_FILTER_KEYS = [
  'status',
  'beneficiaryType',
  'organisationId',
  'fromDate',
  'toDate',
] as const;
