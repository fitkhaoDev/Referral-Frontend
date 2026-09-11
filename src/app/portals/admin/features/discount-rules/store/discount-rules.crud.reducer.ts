import { createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { ApiError } from '@core/models/api.model';
import { DiscountRuleActions } from './discount-rules.actions';

export const DISCOUNT_RULES_CRUD_KEY = 'adminDiscountRulesCrud';

export interface DiscountRulesCrudState {
  readonly saving: boolean;
  readonly error: ApiError | null;
}

const initialState: DiscountRulesCrudState = { saving: false, error: null };

export const discountRulesCrudReducer = createReducer(
  initialState,
  on(
    DiscountRuleActions.create,
    DiscountRuleActions.update,
    DiscountRuleActions.setStatus,
    () => ({ saving: true, error: null }),
  ),
  on(
    DiscountRuleActions.createSuccess,
    DiscountRuleActions.updateSuccess,
    DiscountRuleActions.setStatusSuccess,
    () => initialState,
  ),
  on(
    DiscountRuleActions.createFailure,
    DiscountRuleActions.updateFailure,
    DiscountRuleActions.setStatusFailure,
    (_, { error }) => ({ saving: false, error }),
  ),
);

const selectState = createFeatureSelector<DiscountRulesCrudState>(DISCOUNT_RULES_CRUD_KEY);
export const selectDiscountRulesSaving = createSelector(selectState, (s) => s.saving);
export const selectDiscountRulesCrudError = createSelector(selectState, (s) => s.error);
