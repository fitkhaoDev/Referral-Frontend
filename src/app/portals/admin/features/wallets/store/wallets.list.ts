import { createListFeature } from '@shared/store/create-list-feature';
import { WalletSummary } from '../models/wallet.model';

/** List/query state for the Wallets owner-directory screen. */
export const walletsList = createListFeature<WalletSummary>({
  name: 'adminWallets',
  selectId: (wallet) => wallet.id,
  initialSort: [{ field: 'ownerName', direction: 'asc' }],
});

export const WALLET_FILTER_KEYS = ['ownerType'] as const;
