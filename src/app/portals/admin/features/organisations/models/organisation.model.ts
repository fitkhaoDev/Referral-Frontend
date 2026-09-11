import { Id, IsoDateTime } from '@core/models/api.model';
import { EntityStatus, PasswordState } from '@core/models/common.model';

/**
 * An ORGANISATIONAL referral partner (a hospital, clinic centre, gym chain, …).
 * Enrolled by an admin. `partnerId` and `referralCode` are system-controlled and
 * read-only after creation. One organisation = one centre = one referral code
 * (e.g. `APOLLO-DUMDUM`); the code identifies the organisation, NOT which member
 * referred a customer — that is the mandatory "Referred By" selection in the
 * customer app.
 */
export interface Organisation {
  readonly id: Id;
  /** Auto-generated, e.g. `FK-ORG-000123`. */
  readonly partnerId: string;
  readonly name: string;
  readonly organisationTypeId: Id;
  readonly organisationTypeName: string;
  /** One coupon / referral code per organisation. Immutable after creation. */
  readonly referralCode: string;
  readonly contactPerson: string;
  readonly mobile: string;
  readonly email: string;
  readonly address: string;
  readonly status: EntityStatus;
  readonly passwordState: PasswordState;
  /** Read-only: number of member doctors/accounts under this organisation. */
  readonly memberCount: number;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
  readonly deactivatedAt?: IsoDateTime;
}

export interface CreateOrganisationPayload {
  readonly name: string;
  readonly organisationTypeId: Id;
  readonly referralCode: string;
  readonly contactPerson: string;
  readonly mobile: string;
  readonly email: string;
  readonly address: string;
  readonly status: EntityStatus;
  /** Admin-set temporary password for the organisation's login. Forced change on first sign in. */
  readonly initialPassword: string;
}

export interface UpdateOrganisationPayload {
  readonly name: string;
  readonly organisationTypeId: Id;
  readonly contactPerson: string;
  readonly mobile: string;
  readonly email: string;
  readonly address: string;
}

export interface OrganisationFilters {
  readonly status?: EntityStatus;
  readonly organisationTypeId?: Id;
  readonly passwordState?: PasswordState;
}
