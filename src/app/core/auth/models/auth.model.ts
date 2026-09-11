import { Id, IsoDateTime } from '../../models/api.model';

/** The two isolated portal audiences. A session for one is never valid for the other. */
export type Audience = 'admin' | 'partner';

export type PartnerCategory = 'INDIVIDUAL' | 'ORGANISATION';

/** Identity attached to an authenticated session. Non-authoritative — display only. */
export interface AuthUser {
  readonly id: Id;
  readonly displayName: string;
  readonly email: string;
  /** Coarse roles for this audience (e.g. `['ADMIN']`, `['PARTNER']`). */
  readonly roles: readonly string[];
  /** Partner audience only: human-readable Partner ID (e.g. `FK-IND-000123`). */
  readonly partnerId?: string;
  /** Partner audience only. */
  readonly partnerCategory?: PartnerCategory;
  /** Partner audience only: the partner's coupon/referral code, read-only. */
  readonly referralCode?: string;
}

/**
 * Client-side view of an authenticated session. The backend remains authoritative;
 * every guarded call is re-checked server-side. `mustChangePassword` and
 * `permissions` are mirrored from the login/refresh response and never invented.
 */
export interface AuthSession {
  readonly audience: Audience;
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly tokenType: 'Bearer';
  /** Absolute expiry of the access token. */
  readonly expiresAt: IsoDateTime;
  readonly user: AuthUser;
  /**
   * When true the user must complete `/‹audience›/change-password` before any other
   * route resolves. Enforced by a guard on the client AND by the backend.
   */
  readonly mustChangePassword: boolean;
  /** Fine-grained permission strings for authorization guards (admin RBAC). */
  readonly permissions: readonly string[];
}

export interface LoginRequest {
  /** Email for admins; email or Partner ID for partners. */
  readonly identifier: string;
  readonly password: string;
}

/** Login/refresh response body. `audience` is implied by the endpoint that returned it. */
export interface AuthTokenResponse {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly tokenType: 'Bearer';
  readonly expiresAt: IsoDateTime;
  readonly user: AuthUser;
  readonly mustChangePassword: boolean;
  readonly permissions: readonly string[];
}

export interface RefreshRequest {
  readonly refreshToken: string;
}

export interface ChangePasswordRequest {
  readonly currentPassword: string;
  readonly newPassword: string;
}

export function sessionFromToken(audience: Audience, res: AuthTokenResponse): AuthSession {
  return {
    audience,
    accessToken: res.accessToken,
    refreshToken: res.refreshToken,
    tokenType: res.tokenType,
    expiresAt: res.expiresAt,
    user: res.user,
    mustChangePassword: res.mustChangePassword,
    permissions: res.permissions ?? [],
  };
}
