import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ApiError, Id } from '@core/models/api.model';
import { WalletSummary } from '../models/wallet.model';

export const WalletActions = createActionGroup({
  source: 'Admin Wallets',
  events: {
    'Load Summary': props<{ id: Id }>(),
    'Load Summary Success': props<{ summary: WalletSummary }>(),
    'Load Summary Failure': props<{ error: ApiError }>(),
    'Detail Cleared': emptyProps(),
  },
});
