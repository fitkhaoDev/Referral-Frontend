import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { ApiError } from '@core/models/api.model';
import { OrganisationTypeActions } from './organisation-types.actions';

export const ORGANISATION_TYPES_CRUD_KEY = 'adminOrganisationTypesCrud';

export interface OrganisationTypesCrudState {
  readonly saving: boolean;
  readonly error: ApiError | null;
}

const initialState: OrganisationTypesCrudState = { saving: false, error: null };

export const organisationTypesCrudReducer = createReducer(
  initialState,
  on(
    OrganisationTypeActions.create,
    OrganisationTypeActions.update,
    OrganisationTypeActions.setStatus,
    () => ({ saving: true, error: null }),
  ),
  on(
    OrganisationTypeActions.createSuccess,
    OrganisationTypeActions.updateSuccess,
    OrganisationTypeActions.setStatusSuccess,
    () => initialState,
  ),
  on(
    OrganisationTypeActions.createFailure,
    OrganisationTypeActions.updateFailure,
    OrganisationTypeActions.setStatusFailure,
    (_, { error }) => ({ saving: false, error }),
  ),
);

const selectState = createFeatureSelector<OrganisationTypesCrudState>(ORGANISATION_TYPES_CRUD_KEY);
export const selectOrganisationTypesSaving = createSelector(selectState, (s) => s.saving);
export const selectOrganisationTypesCrudError = createSelector(selectState, (s) => s.error);
