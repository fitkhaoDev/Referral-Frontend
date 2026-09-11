import { Id, IsoDateTime } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';

/**
 * A doctor / account that belongs to exactly one {@link Organisation}. When a
 * customer uses the organisation's referral code in the FitKhao customer app they
 * must pick a member in the mandatory "Referred By" field — that attribution
 * (validated backend-side: member active, member belongs to the org) is permanent.
 *
 * Members are NOT portal login accounts — the organisation itself logs in. A member
 * can still earn its own (independent) doctor incentives; that lives in the
 * commissions/wallet domain, not here.
 */
export interface OrganisationMember {
  readonly id: Id;
  readonly organisationId: Id;
  /** Denormalised for cross-organisation list display. */
  readonly organisationName: string;
  /** Denormalised — the code a customer types; identifies the organisation, not the member. */
  readonly organisationReferralCode: string;
  readonly name: string;
  readonly specialisation?: string;
  readonly mobile: string;
  readonly email: string;
  readonly status: EntityStatus;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
}

export interface CreateOrganisationMemberPayload {
  readonly organisationId: Id;
  readonly name: string;
  readonly specialisation?: string;
  readonly mobile: string;
  readonly email: string;
  readonly status: EntityStatus;
}

export interface UpdateOrganisationMemberPayload {
  readonly name: string;
  readonly specialisation?: string;
  readonly mobile: string;
  readonly email: string;
}

export interface OrganisationMemberFilters {
  readonly organisationId?: Id;
  readonly status?: EntityStatus;
}
