import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { ApiError } from '@core/models/api.model';
import { Withdrawal, WithdrawalPolicy } from '../models/withdrawal.model';
import { WithdrawalActions } from './withdrawals.actions';

export const WITHDRAWALS_DETAIL_KEY = 'adminWithdrawalsDetail';

export interface WithdrawalsDetailState {
  readonly withdrawal: Withdrawal | null;
  readonly loading: boolean;
  readonly loadError: ApiError | null;
  readonly policy: WithdrawalPolicy | null;
  readonly acting: boolean;
  readonly actionError: ApiError | null;
}

const initialState: WithdrawalsDetailState = {
  withdrawal: null,
  loading: false,
  loadError: null,
  policy: null,
  acting: false,
  actionError: null,
};

export const withdrawalsDetailReducer = createReducer(
  initialState,

  on(WithdrawalActions.detailCleared, (s) => ({
    ...initialState,
    // keep the policy — it's screen-wide context, not per-withdrawal
    policy: s.policy,
  })),

  on(WithdrawalActions.loadDetail, (s) => ({ ...s, loading: true, loadError: null })),
  on(WithdrawalActions.loadDetailSuccess, (s, { withdrawal }) => ({
    ...s,
    loading: false,
    withdrawal,
  })),
  on(WithdrawalActions.loadDetailFailure, (s, { error }) => ({
    ...s,
    loading: false,
    loadError: error,
  })),

  on(WithdrawalActions.loadPolicySuccess, (s, { policy }) => ({ ...s, policy })),

  on(
    WithdrawalActions.approve,
    WithdrawalActions.reject,
    WithdrawalActions.markProcessing,
    WithdrawalActions.markPaid,
    WithdrawalActions.markFailed,
    (s) => ({ ...s, acting: true, actionError: null }),
  ),
  on(WithdrawalActions.actionSuccess, (s, { withdrawal }) => ({
    ...s,
    acting: false,
    withdrawal: s.withdrawal?.id === withdrawal.id ? withdrawal : s.withdrawal,
  })),
  on(WithdrawalActions.actionFailure, (s, { error }) => ({ ...s, acting: false, actionError: error })),
  on(WithdrawalActions.actionErrorCleared, (s) => ({ ...s, actionError: null })),
);

const selectState = createFeatureSelector<WithdrawalsDetailState>(WITHDRAWALS_DETAIL_KEY);
export const selectWithdrawalDetail = createSelector(selectState, (s) => s.withdrawal);
export const selectWithdrawalDetailLoading = createSelector(selectState, (s) => s.loading);
export const selectWithdrawalDetailLoadError = createSelector(selectState, (s) => s.loadError);
export const selectWithdrawalPolicy = createSelector(selectState, (s) => s.policy);
export const selectWithdrawalActing = createSelector(selectState, (s) => s.acting);
export const selectWithdrawalActionError = createSelector(selectState, (s) => s.actionError);
