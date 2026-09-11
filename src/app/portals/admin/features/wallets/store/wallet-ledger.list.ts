import { createListFeature } from '@shared/store/create-list-feature';
import { WalletTransaction } from '../models/wallet.model';

/**
 * List/query state for a single wallet's ledger on the detail screen. The wallet
 * being viewed is carried in `filters.walletId` (never in the URL — the spec keeps
 * financial context out of URLs); `type`, `status` and the date range are the
 * user-facing filters.
 */
export const walletLedgerList = createListFeature<WalletTransaction>({
  name: 'adminWalletLedger',
  selectId: (txn) => txn.id,
  initialSort: [{ field: 'occurredAt', direction: 'desc' }],
});

export const WALLET_LEDGER_FILTER_KEYS = ['type', 'status', 'fromDate', 'toDate'] as const;
