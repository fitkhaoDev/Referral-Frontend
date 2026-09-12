import { Id, IsoDateTime } from '../../models/api.model';

/** The two isolated portal audiences. A session for one is never valid for the other. */
export type Audience = 'admin' | 'partner';

export type PartnerCategory = 'INDIVIDUAL' | 'ORGANISATION';

/** Identity attached to an authenticated session. Non-authoritative — display only. */
export interface AuthUser {
  readonly id: Id;
  readonly displayName: string;
  readonly email: string;
  /** Coarse roles for this audience (e.g. `['admin']`, `['referral_partner']`). */
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

/** Backend login response — matches unifiedLogin.ts response shape. */
export interface AuthTokenResponse {
  readonly token: string;
  readonly role: string;
  readonly mustChangePassword?: boolean;
  readonly partner?: {
    readonly id: Id;
    readonly accountId?: Id;
    readonly profileId?: Id;
    readonly name?: string;
    readonly email?: string;
    readonly partnerId?: string;
    readonly couponCode?: string;
    readonly passwordState?: string;
  };
  readonly admin?: {
    readonly id: Id;
    readonly accountId?: Id;
    readonly profileId?: Id;
    readonly employeeId?: string;
    readonly name?: string;
    readonly email?: string;
    readonly permissions?: readonly string[];
    readonly adminRole?: string;
    readonly department?: string;
    readonly designation?: string;
    readonly profilePhoto?: string;
    readonly isActive?: boolean;
  };
}

export interface RefreshRequest {
  readonly refreshToken: string;
}

export interface ChangePasswordRequest {
  readonly currentPassword: string;
  readonly newPassword: string;
}

export function sessionFromToken(audience: Audience, res: AuthTokenResponse): AuthSession {
  const profile = audience === 'partner' ? res.partner : res.admin;
  return {
    audience,
    accessToken: res.token,
    tokenType: 'Bearer',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: String(profile?.id ?? ''),
      displayName: profile?.name ?? '',
      email: profile?.email ?? '',
      roles: [res.role],
      partnerId: res.partner?.partnerId,
      referralCode: res.partner?.couponCode,
    },
    mustChangePassword: res.mustChangePassword ?? false,
    permissions: res.admin?.permissions ?? [],
  };
}
