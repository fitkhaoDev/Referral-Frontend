/** Standard active/inactive lifecycle for admin-managed registry entities. */
export type EntityStatus = 'ACTIVE' | 'INACTIVE';

/** The two top-level partner categories. */
export type PartnerCategory = 'INDIVIDUAL' | 'ORGANISATION';

export const ENTITY_STATUS_LABEL: Record<EntityStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const PARTNER_CATEGORY_LABEL: Record<PartnerCategory, string> = {
  INDIVIDUAL: 'Individual',
  ORGANISATION: 'Organisation',
};

/** Forced-password state for any admin-created login account. Backend-authoritative. */
export type PasswordState = 'MUST_CHANGE' | 'OK';

export const PASSWORD_STATE_LABEL: Record<PasswordState, string> = {
  MUST_CHANGE: 'Must change password',
  OK: 'Password set',
};

/**
 * Result of an admin password reset. The existing password is never revealed;
 * whether the new temporary password is shown to the admin or delivered
 * out-of-band is a backend-policy decision (OPEN QUESTION for the backend spec).
 */
export interface PasswordResetResult {
  readonly passwordState: 'MUST_CHANGE';
  readonly delivery: 'ADMIN_DISPLAY' | 'SMS' | 'EMAIL';
  /** Present only when `delivery === 'ADMIN_DISPLAY'` — shown once, never stored. */
  readonly temporaryPassword?: string;
}
