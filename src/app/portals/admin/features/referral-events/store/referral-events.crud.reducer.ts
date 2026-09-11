import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { ApiError } from '@core/models/api.model';
import { ReferralEventActions } from './referral-events.actions';

export const REFERRAL_EVENTS_CRUD_KEY = 'adminReferralEventsCrud';

export interface ReferralEventsCrudState {
  readonly saving: boolean;
  readonly error: ApiError | null;
}

const initialState: ReferralEventsCrudState = { saving: false, error: null };

export const referralEventsCrudReducer = createReducer(
  initialState,
  on(
    ReferralEventActions.create,
    ReferralEventActions.update,
    ReferralEventActions.setStatus,
    () => ({ saving: true, error: null }),
  ),
  on(
    ReferralEventActions.createSuccess,
    ReferralEventActions.updateSuccess,
    ReferralEventActions.setStatusSuccess,
    () => initialState,
  ),
  on(
    ReferralEventActions.createFailure,
    ReferralEventActions.updateFailure,
    ReferralEventActions.setStatusFailure,
    (_, { error }) => ({ saving: false, error }),
  ),
);

const selectState = createFeatureSelector<ReferralEventsCrudState>(REFERRAL_EVENTS_CRUD_KEY);
export const selectReferralEventsSaving = createSelector(selectState, (s) => s.saving);
export const selectReferralEventsCrudError = createSelector(selectState, (s) => s.error);
