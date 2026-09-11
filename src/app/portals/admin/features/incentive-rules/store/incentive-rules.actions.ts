import { createActionGroup, props } from '@ngrx/store';
import { ApiError, Id } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateIncentiveRulePayload,
  IncentiveRule,
  UpdateIncentiveRulePayload,
} from '../models/incentive-rule.model';

export const IncentiveRuleActions = createActionGroup({
  source: 'Admin Incentive Rules',
  events: {
    Create: props<{ payload: CreateIncentiveRulePayload }>(),
    'Create Success': props<{ rule: IncentiveRule }>(),
    'Create Failure': props<{ error: ApiError }>(),

    Update: props<{ id: Id; payload: UpdateIncentiveRulePayload }>(),
    'Update Success': props<{ rule: IncentiveRule }>(),
    'Update Failure': props<{ error: ApiError }>(),

    'Set Status': props<{ id: Id; status: EntityStatus }>(),
    'Set Status Success': props<{ rule: IncentiveRule }>(),
    'Set Status Failure': props<{ error: ApiError }>(),
  },
});
