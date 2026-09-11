import { createActionGroup, props } from '@ngrx/store';
import { ApiError, Id } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreatePartnerTypePayload,
  PartnerType,
  UpdatePartnerTypePayload,
} from '../models/partner-type.model';

export const PartnerTypeActions = createActionGroup({
  source: 'Admin Partner Types',
  events: {
    Create: props<{ payload: CreatePartnerTypePayload }>(),
    'Create Success': props<{ partnerType: PartnerType }>(),
    'Create Failure': props<{ error: ApiError }>(),

    Update: props<{ id: Id; payload: UpdatePartnerTypePayload }>(),
    'Update Success': props<{ partnerType: PartnerType }>(),
    'Update Failure': props<{ error: ApiError }>(),

    'Set Status': props<{ id: Id; status: EntityStatus }>(),
    'Set Status Success': props<{ partnerType: PartnerType }>(),
    'Set Status Failure': props<{ error: ApiError }>(),
  },
});
