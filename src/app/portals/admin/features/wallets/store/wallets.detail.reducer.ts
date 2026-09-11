import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { ApiError } from '@core/models/api.model';
import { WalletSummary } from '../models/wallet.model';
import { WalletActions } from './wallets.actions';

export const WALLETS_DETAIL_KEY = 'adminWalletDetail';

export interface WalletsDetailState {
  readonly summary: WalletSummary | null;
  readonly loading: boolean;
  readonly loadError: ApiError | null;
}

const initialState: WalletsDetailState = {
  summary: null,
  loading: false,
  loadError: null,
};

export const walletsDetailReducer = createReducer(
  initialState,
  on(WalletActions.detailCleared, () => initialState),
  on(WalletActions.loadSummary, (s) => ({ ...s, loading: true, loadError: null })),
  on(WalletActions.loadSummarySuccess, (s, { summary }) => ({ ...s, loading: false, summary })),
  on(WalletActions.loadSummaryFailure, (s, { error }) => ({
    ...s,
    loading: false,
    loadError: error,
  })),
);

const selectState = createFeatureSelector<WalletsDetailState>(WALLETS_DETAIL_KEY);
export const selectWalletSummary = createSelector(selectState, (s) => s.summary);
export const selectWalletSummaryLoading = createSelector(selectState, (s) => s.loading);
export const selectWalletSummaryLoadError = createSelector(selectState, (s) => s.loadError);
