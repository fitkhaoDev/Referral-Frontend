import { createActionGroup, props } from '@ngrx/store';
import { ApiError, Id } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateReferralEventPayload,
  ReferralEvent,
  UpdateReferralEventPayload,
} from '../models/referral-event.model';

export const ReferralEventActions = createActionGroup({
  source: 'Admin Referral Events',
  events: {
    Create: props<{ payload: CreateReferralEventPayload }>(),
    'Create Success': props<{ event: ReferralEvent }>(),
    'Create Failure': props<{ error: ApiError }>(),

    Update: props<{ id: Id; payload: UpdateReferralEventPayload }>(),
    'Update Success': props<{ event: ReferralEvent }>(),
    'Update Failure': props<{ error: ApiError }>(),

    'Set Status': props<{ id: Id; status: EntityStatus }>(),
    'Set Status Success': props<{ event: ReferralEvent }>(),
    'Set Status Failure': props<{ error: ApiError }>(),
  },
});
