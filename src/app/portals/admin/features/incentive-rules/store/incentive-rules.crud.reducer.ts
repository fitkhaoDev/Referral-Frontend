import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { ApiError } from '@core/models/api.model';
import { IncentiveRuleActions } from './incentive-rules.actions';

export const INCENTIVE_RULES_CRUD_KEY = 'adminIncentiveRulesCrud';

export interface IncentiveRulesCrudState {
  readonly saving: boolean;
  readonly error: ApiError | null;
}

const initialState: IncentiveRulesCrudState = { saving: false, error: null };

export const incentiveRulesCrudReducer = createReducer(
  initialState,
  on(
    IncentiveRuleActions.create,
    IncentiveRuleActions.update,
    IncentiveRuleActions.setStatus,
    () => ({ saving: true, error: null }),
  ),
  on(
    IncentiveRuleActions.createSuccess,
    IncentiveRuleActions.updateSuccess,
    IncentiveRuleActions.setStatusSuccess,
    () => initialState,
  ),
  on(
    IncentiveRuleActions.createFailure,
    IncentiveRuleActions.updateFailure,
    IncentiveRuleActions.setStatusFailure,
    (_, { error }) => ({ saving: false, error }),
  ),
);

const selectState = createFeatureSelector<IncentiveRulesCrudState>(INCENTIVE_RULES_CRUD_KEY);
export const selectIncentiveRulesSaving = createSelector(selectState, (s) => s.saving);
export const selectIncentiveRulesCrudError = createSelector(selectState, (s) => s.error);
