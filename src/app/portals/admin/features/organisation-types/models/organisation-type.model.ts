import { Id, IsoDateTime } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';

/**
 * A dynamic classification for ORGANISATIONAL referral partners (Hospital, Clinic
 * Chain, Corporate, Gym Chain, …). Admin-managed. Different organisation types can
 * carry different discount / incentive rule sets — those rules are separate
 * entities that reference this type's `code`, which is immutable after creation.
 */
export interface OrganisationType {
  readonly id: Id;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly status: EntityStatus;
  /** Read-only: number of organisations currently of this type. */
  readonly organisationCount: number;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
}

export interface CreateOrganisationTypePayload {
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly status: EntityStatus;
}

export interface UpdateOrganisationTypePayload {
  readonly name: string;
  readonly description?: string;
  readonly status: EntityStatus;
}

export interface OrganisationTypeFilters {
  readonly status?: EntityStatus;
}
