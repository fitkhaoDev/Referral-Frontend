import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { ApiError } from '@core/models/api.model';
import { Partner, PartnerPasswordResetResult } from '../models/partner.model';
import { PartnerActions } from './partners.actions';

export const PARTNERS_DETAIL_KEY = 'adminPartnersDetail';

export interface PartnersDetailState {
  readonly partner: Partner | null;
  readonly loading: boolean;
  readonly loadError: ApiError | null;
  readonly saving: boolean;
  readonly saveError: ApiError | null;
  readonly resetResult: PartnerPasswordResetResult | null;
}

const initialState: PartnersDetailState = {
  partner: null,
  loading: false,
  loadError: null,
  saving: false,
  saveError: null,
  resetResult: null,
};

export const partnersDetailReducer = createReducer(
  initialState,

  on(PartnerActions.detailCleared, () => initialState),

  on(PartnerActions.loadDetail, (s) => ({ ...s, loading: true, loadError: null })),
  on(PartnerActions.loadDetailSuccess, (s, { partner }) => ({ ...s, loading: false, partner })),
  on(PartnerActions.loadDetailFailure, (s, { error }) => ({
    ...s,
    loading: false,
    loadError: error,
  })),

  on(
    PartnerActions.create,
    PartnerActions.update,
    PartnerActions.setStatus,
    PartnerActions.resetPassword,
    (s) => ({ ...s, saving: true, saveError: null }),
  ),
  on(PartnerActions.createSuccess, (s) => ({ ...s, saving: false })),
  on(PartnerActions.updateSuccess, PartnerActions.setStatusSuccess, (s, { partner }) => ({
    ...s,
    saving: false,
    partner,
  })),
  on(PartnerActions.resetPasswordSuccess, (s, { result }) => ({
    ...s,
    saving: false,
    resetResult: result,
    partner: s.partner ? { ...s.partner, passwordState: 'MUST_CHANGE' } : s.partner,
  })),
  on(
    PartnerActions.createFailure,
    PartnerActions.updateFailure,
    PartnerActions.setStatusFailure,
    PartnerActions.resetPasswordFailure,
    (s, { error }) => ({ ...s, saving: false, saveError: error }),
  ),

  on(PartnerActions.resetResultCleared, (s) => ({ ...s, resetResult: null })),
);

const selectState = createFeatureSelector<PartnersDetailState>(PARTNERS_DETAIL_KEY);
export const selectPartnerDetail = createSelector(selectState, (s) => s.partner);
export const selectPartnerDetailLoading = createSelector(selectState, (s) => s.loading);
export const selectPartnerDetailLoadError = createSelector(selectState, (s) => s.loadError);
export const selectPartnerSaving = createSelector(selectState, (s) => s.saving);
export const selectPartnerSaveError = createSelector(selectState, (s) => s.saveError);
export const selectPartnerResetResult = createSelector(selectState, (s) => s.resetResult);
