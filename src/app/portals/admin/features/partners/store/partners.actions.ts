import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ApiError, Id } from '@core/models/api.model';
import {
  CreatePartnerPayload,
  Partner,
  PartnerAccountStatus,
  PartnerPasswordResetResult,
  UpdatePartnerPayload,
} from '../models/partner.model';

export const PartnerActions = createActionGroup({
  source: 'Admin Partners',
  events: {
    'Load Detail': props<{ id: Id }>(),
    'Load Detail Success': props<{ partner: Partner }>(),
    'Load Detail Failure': props<{ error: ApiError }>(),
    'Detail Cleared': emptyProps(),

    Create: props<{ payload: CreatePartnerPayload }>(),
    'Create Success': props<{ partner: Partner }>(),
    'Create Failure': props<{ error: ApiError }>(),

    Update: props<{ id: Id; payload: UpdatePartnerPayload }>(),
    'Update Success': props<{ partner: Partner }>(),
    'Update Failure': props<{ error: ApiError }>(),

    'Set Status': props<{ id: Id; status: PartnerAccountStatus }>(),
    'Set Status Success': props<{ partner: Partner }>(),
    'Set Status Failure': props<{ error: ApiError }>(),

    'Reset Password': props<{ id: Id }>(),
    'Reset Password Success': props<{ result: PartnerPasswordResetResult }>(),
    'Reset Password Failure': props<{ error: ApiError }>(),
    'Reset Result Cleared': emptyProps(),
  },
});
