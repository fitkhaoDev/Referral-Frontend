import { Id, IsoDateTime } from '@core/models/api.model';

/** Account lifecycle. Deactivation is NOT deletion — all historical data is retained. */
export type PartnerAccountStatus = 'ACTIVE' | 'INACTIVE';

/** Whether the partner must replace a temporary password on next login. Backend-authoritative. */
export type PartnerPasswordState = 'MUST_CHANGE' | 'OK';

/**
 * An INDIVIDUAL referral partner enrolled by an admin. `partnerId` and `referralCode`
 * are system-controlled and read-only after creation; `passwordState` is mirrored
 * from the backend and never set by the client.
 */
export interface Partner {
  readonly id: Id;
  /** Auto-generated, human-readable, e.g. `FK-IND-000123`. */
  readonly partnerId: string;
  readonly name: string;
  readonly partnerTypeId: Id;
  /** Denormalised for list display. */
  readonly partnerTypeName: string;
  readonly partnerTypeCode: string;
  /** e.g. a doctor's specialisation. Optional. */
  readonly specialisation?: string;
  readonly mobile: string;
  readonly email: string;
  readonly professionalAddress?: string;
  /** Coupon / referral code. Unique, system-controlled after creation. */
  readonly referralCode: string;
  readonly status: PartnerAccountStatus;
  readonly passwordState: PartnerPasswordState;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
  readonly deactivatedAt?: IsoDateTime;
}

export interface CreatePartnerPayload {
  readonly name: string;
  readonly partnerTypeId: Id;
  readonly specialisation?: string;
  readonly mobile: string;
  readonly email: string;
  readonly professionalAddress?: string;
  readonly referralCode: string;
  readonly status: PartnerAccountStatus;
  /** Admin-set temporary password. Partner is forced to change it on first login. */
  readonly initialPassword: string;
}

export interface UpdatePartnerPayload {
  readonly name: string;
  readonly partnerTypeId: Id;
  readonly specialisation?: string;
  readonly mobile: string;
  readonly email: string;
  readonly professionalAddress?: string;
}

export interface PartnerFilters {
  readonly status?: PartnerAccountStatus;
  readonly partnerTypeId?: Id;
  readonly passwordState?: PartnerPasswordState;
}

/** Result of an admin password reset. The existing password is never revealed. */
export interface PartnerPasswordResetResult {
  readonly partnerId: string;
  readonly passwordState: 'MUST_CHANGE';
  /** How the temporary password reaches the partner. */
  readonly delivery: 'ADMIN_DISPLAY' | 'SMS' | 'EMAIL';
  /** Present only when `delivery === 'ADMIN_DISPLAY'` — shown once, never stored. */
  readonly temporaryPassword?: string;
}

export const PARTNER_STATUS_LABEL: Record<PartnerAccountStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const PARTNER_PASSWORD_STATE_LABEL: Record<PartnerPasswordState, string> = {
  MUST_CHANGE: 'Must change password',
  OK: 'Password set',
};
