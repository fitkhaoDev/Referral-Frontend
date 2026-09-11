import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { ApiError } from '@core/models/api.model';
import { PartnerTypeActions } from './partner-types.actions';

export const PARTNER_TYPES_CRUD_KEY = 'adminPartnerTypesCrud';

export interface PartnerTypesCrudState {
  readonly saving: boolean;
  readonly error: ApiError | null;
}

const initialState: PartnerTypesCrudState = { saving: false, error: null };

export const partnerTypesCrudReducer = createReducer(
  initialState,
  on(
    PartnerTypeActions.create,
    PartnerTypeActions.update,
    PartnerTypeActions.setStatus,
    () => ({ saving: true, error: null }),
  ),
  on(
    PartnerTypeActions.createSuccess,
    PartnerTypeActions.updateSuccess,
    PartnerTypeActions.setStatusSuccess,
    () => initialState,
  ),
  on(
    PartnerTypeActions.createFailure,
    PartnerTypeActions.updateFailure,
    PartnerTypeActions.setStatusFailure,
    (_, { error }) => ({ saving: false, error }),
  ),
);

const selectState = createFeatureSelector<PartnerTypesCrudState>(PARTNER_TYPES_CRUD_KEY);
export const selectPartnerTypesSaving = createSelector(selectState, (s) => s.saving);
export const selectPartnerTypesCrudError = createSelector(selectState, (s) => s.error);
