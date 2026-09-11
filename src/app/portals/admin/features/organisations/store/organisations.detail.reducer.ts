import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { ApiError } from '@core/models/api.model';
import { PasswordResetResult } from '@core/models/common.model';
import { Organisation } from '../models/organisation.model';
import { OrganisationActions } from './organisations.actions';

export const ORGANISATIONS_DETAIL_KEY = 'adminOrganisationsDetail';

export interface OrganisationsDetailState {
  readonly organisation: Organisation | null;
  readonly loading: boolean;
  readonly loadError: ApiError | null;
  readonly saving: boolean;
  readonly saveError: ApiError | null;
  readonly resetResult: PasswordResetResult | null;
}

const initialState: OrganisationsDetailState = {
  organisation: null,
  loading: false,
  loadError: null,
  saving: false,
  saveError: null,
  resetResult: null,
};

export const organisationsDetailReducer = createReducer(
  initialState,

  on(OrganisationActions.detailCleared, () => initialState),

  on(OrganisationActions.loadDetail, (s) => ({ ...s, loading: true, loadError: null })),
  on(OrganisationActions.loadDetailSuccess, (s, { organisation }) => ({
    ...s,
    loading: false,
    organisation,
  })),
  on(OrganisationActions.loadDetailFailure, (s, { error }) => ({
    ...s,
    loading: false,
    loadError: error,
  })),

  on(
    OrganisationActions.create,
    OrganisationActions.update,
    OrganisationActions.setStatus,
    OrganisationActions.resetPassword,
    (s) => ({ ...s, saving: true, saveError: null }),
  ),
  on(OrganisationActions.createSuccess, (s) => ({ ...s, saving: false })),
  on(OrganisationActions.updateSuccess, OrganisationActions.setStatusSuccess, (s, { organisation }) => ({
    ...s,
    saving: false,
    organisation,
  })),
  on(OrganisationActions.resetPasswordSuccess, (s, { result }) => ({
    ...s,
    saving: false,
    resetResult: result,
    organisation: s.organisation
      ? { ...s.organisation, passwordState: 'MUST_CHANGE' }
      : s.organisation,
  })),
  on(
    OrganisationActions.createFailure,
    OrganisationActions.updateFailure,
    OrganisationActions.setStatusFailure,
    OrganisationActions.resetPasswordFailure,
    (s, { error }) => ({ ...s, saving: false, saveError: error }),
  ),

  on(OrganisationActions.resetResultCleared, (s) => ({ ...s, resetResult: null })),
);

const selectState = createFeatureSelector<OrganisationsDetailState>(ORGANISATIONS_DETAIL_KEY);
export const selectOrganisationDetail = createSelector(selectState, (s) => s.organisation);
export const selectOrganisationDetailLoading = createSelector(selectState, (s) => s.loading);
export const selectOrganisationDetailLoadError = createSelector(selectState, (s) => s.loadError);
export const selectOrganisationSaving = createSelector(selectState, (s) => s.saving);
export const selectOrganisationSaveError = createSelector(selectState, (s) => s.saveError);
export const selectOrganisationResetResult = createSelector(selectState, (s) => s.resetResult);
