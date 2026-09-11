import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ApiError, Id } from '@core/models/api.model';
import { EntityStatus, PasswordResetResult } from '@core/models/common.model';
import {
  CreateOrganisationPayload,
  Organisation,
  UpdateOrganisationPayload,
} from '../models/organisation.model';

export const OrganisationActions = createActionGroup({
  source: 'Admin Organisations',
  events: {
    'Load Detail': props<{ id: Id }>(),
    'Load Detail Success': props<{ organisation: Organisation }>(),
    'Load Detail Failure': props<{ error: ApiError }>(),
    'Detail Cleared': emptyProps(),

    Create: props<{ payload: CreateOrganisationPayload }>(),
    'Create Success': props<{ organisation: Organisation }>(),
    'Create Failure': props<{ error: ApiError }>(),

    Update: props<{ id: Id; payload: UpdateOrganisationPayload }>(),
    'Update Success': props<{ organisation: Organisation }>(),
    'Update Failure': props<{ error: ApiError }>(),

    'Set Status': props<{ id: Id; status: EntityStatus }>(),
    'Set Status Success': props<{ organisation: Organisation }>(),
    'Set Status Failure': props<{ error: ApiError }>(),

    'Reset Password': props<{ id: Id }>(),
    'Reset Password Success': props<{ result: PasswordResetResult }>(),
    'Reset Password Failure': props<{ error: ApiError }>(),
    'Reset Result Cleared': emptyProps(),
  },
});
