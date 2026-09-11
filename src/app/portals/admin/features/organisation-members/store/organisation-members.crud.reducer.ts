import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { ApiError } from '@core/models/api.model';
import { OrganisationMemberActions } from './organisation-members.actions';

export const ORGANISATION_MEMBERS_CRUD_KEY = 'adminOrganisationMembersCrud';

export interface OrganisationMembersCrudState {
  readonly saving: boolean;
  readonly error: ApiError | null;
}

const initialState: OrganisationMembersCrudState = { saving: false, error: null };

export const organisationMembersCrudReducer = createReducer(
  initialState,
  on(
    OrganisationMemberActions.create,
    OrganisationMemberActions.update,
    OrganisationMemberActions.setStatus,
    () => ({ saving: true, error: null }),
  ),
  on(
    OrganisationMemberActions.createSuccess,
    OrganisationMemberActions.updateSuccess,
    OrganisationMemberActions.setStatusSuccess,
    () => initialState,
  ),
  on(
    OrganisationMemberActions.createFailure,
    OrganisationMemberActions.updateFailure,
    OrganisationMemberActions.setStatusFailure,
    (_, { error }) => ({ saving: false, error }),
  ),
);

const selectState = createFeatureSelector<OrganisationMembersCrudState>(
  ORGANISATION_MEMBERS_CRUD_KEY,
);
export const selectOrganisationMembersSaving = createSelector(selectState, (s) => s.saving);
export const selectOrganisationMembersCrudError = createSelector(selectState, (s) => s.error);
