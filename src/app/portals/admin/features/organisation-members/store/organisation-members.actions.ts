import { createActionGroup, props } from '@ngrx/store';
import { ApiError, Id } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateOrganisationMemberPayload,
  OrganisationMember,
  UpdateOrganisationMemberPayload,
} from '../models/organisation-member.model';

export const OrganisationMemberActions = createActionGroup({
  source: 'Admin Organisation Members',
  events: {
    Create: props<{ payload: CreateOrganisationMemberPayload }>(),
    'Create Success': props<{ member: OrganisationMember }>(),
    'Create Failure': props<{ error: ApiError }>(),

    Update: props<{ id: Id; payload: UpdateOrganisationMemberPayload }>(),
    'Update Success': props<{ member: OrganisationMember }>(),
    'Update Failure': props<{ error: ApiError }>(),

    'Set Status': props<{ id: Id; status: EntityStatus }>(),
    'Set Status Success': props<{ member: OrganisationMember }>(),
    'Set Status Failure': props<{ error: ApiError }>(),
  },
});
