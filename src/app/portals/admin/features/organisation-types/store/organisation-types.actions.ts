import { createActionGroup, props } from '@ngrx/store';
import { ApiError, Id } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateOrganisationTypePayload,
  OrganisationType,
  UpdateOrganisationTypePayload,
} from '../models/organisation-type.model';

export const OrganisationTypeActions = createActionGroup({
  source: 'Admin Organisation Types',
  events: {
    Create: props<{ payload: CreateOrganisationTypePayload }>(),
    'Create Success': props<{ organisationType: OrganisationType }>(),
    'Create Failure': props<{ error: ApiError }>(),

    Update: props<{ id: Id; payload: UpdateOrganisationTypePayload }>(),
    'Update Success': props<{ organisationType: OrganisationType }>(),
    'Update Failure': props<{ error: ApiError }>(),

    'Set Status': props<{ id: Id; status: EntityStatus }>(),
    'Set Status Success': props<{ organisationType: OrganisationType }>(),
    'Set Status Failure': props<{ error: ApiError }>(),
  },
});
