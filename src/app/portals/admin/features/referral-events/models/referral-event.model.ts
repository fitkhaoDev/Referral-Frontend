import { Id, IsoDateTime } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';

/**
 * A configurable point in the referral lifecycle that the incentive engine can
 * react to (Referral Created, Counselling Completed, Subscription Purchased,
 * Subscription Renewed, Payment Refunded, …). Admin-managed; the frontend renders
 * whatever the backend defines — nothing here is hard-coded.
 *
 * `code` is a stable UPPER_SNAKE identifier referenced by incentive rules and is
 * immutable after creation. `system` events ship with the platform and can be
 * deactivated but not conceptually removed.
 */
export interface ReferralEvent {
  readonly id: Id;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly status: EntityStatus;
  /** Display order in pickers and timelines (ascending). */
  readonly sortOrder: number;
  readonly system: boolean;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
}

export interface CreateReferralEventPayload {
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly status: EntityStatus;
  readonly sortOrder: number;
}

export interface UpdateReferralEventPayload {
  readonly name: string;
  readonly description?: string;
  readonly status: EntityStatus;
  readonly sortOrder: number;
}

export interface ReferralEventFilters {
  readonly status?: EntityStatus;
  readonly system?: 'true' | 'false';
}
