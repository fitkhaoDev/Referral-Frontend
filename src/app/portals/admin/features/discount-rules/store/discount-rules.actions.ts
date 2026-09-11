import { createActionGroup, props } from '@ngrx/store';
import { ApiError, Id } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateDiscountRulePayload,
  DiscountRule,
  UpdateDiscountRulePayload,
} from '../models/discount-rule.model';

export const DiscountRuleActions = createActionGroup({
  source: 'Admin Discount Rules',
  events: {
    Create: props<{ payload: CreateDiscountRulePayload }>(),
    'Create Success': props<{ rule: DiscountRule }>(),
    'Create Failure': props<{ error: ApiError }>(),

    Update: props<{ id: Id; payload: UpdateDiscountRulePayload }>(),
    'Update Success': props<{ rule: DiscountRule }>(),
    'Update Failure': props<{ error: ApiError }>(),

    'Set Status': props<{ id: Id; status: EntityStatus }>(),
    'Set Status Success': props<{ rule: DiscountRule }>(),
    'Set Status Failure': props<{ error: ApiError }>(),
  },
});
