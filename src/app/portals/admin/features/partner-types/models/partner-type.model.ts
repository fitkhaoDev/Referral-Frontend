import { Id, IsoDateTime } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';

/**
 * A dynamic classification for INDIVIDUAL referral partners (Doctor, Nutritionist,
 * Fitness Trainer, …). Admin-managed; never hard-coded. `code` is a stable
 * UPPER_SNAKE identifier used by incentive rules and is immutable after creation.
 */
export interface PartnerType {
  readonly id: Id;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly status: EntityStatus;
  /** Read-only: number of partners currently assigned this type. */
  readonly partnerCount: number;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
}

export interface CreatePartnerTypePayload {
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly status: EntityStatus;
}

export interface UpdatePartnerTypePayload {
  readonly name: string;
  readonly description?: string;
  readonly status: EntityStatus;
}

export interface PartnerTypeFilters {
  readonly status?: EntityStatus;
}
