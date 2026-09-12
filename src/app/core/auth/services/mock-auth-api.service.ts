import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mockFail, mockOk } from '@core/data-access/mock/mock-http.util';
import {
  Audience,
  AuthTokenResponse,
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  RefreshRequest,
} from '../models/auth.model';
import { AuthApi } from './auth-api.abstract';

interface MockAccount {
  audience: Audience;
  identifiers: string[];
  password: string;
  mustChangePassword: boolean;
  user: AuthUser;
  permissions: string[];
  deactivated: boolean;
}

const ADMIN_PERMISSIONS = [
  'partner:read', 'partner:write', 'partner:activate', 'partner:reset-password',
  'partner-type:manage', 'organisation:manage', 'organisation-type:manage',
  'organisation-member:manage', 'referral:read', 'referral-event:manage',
  'incentive-rule:manage', 'discount-rule:manage', 'commission:read',
  'wallet:read', 'withdrawal:read', 'withdrawal:manage', 'analytics:read',
];

/**
 * Development-only in-memory authentication.
 *
 * Demo credentials (dev only):
 *   Admin              admin@fitkhao.com / Admin@123
 *   Partner (forced)   dr.john@example.com / Temp@1234   → mustChangePassword=true
 *   Partner (normal)   dr.mehta@apollo.com / Partner@123
 *   Partner (disabled) old.partner@example.com / Partner@123  → 403 on login
 */
@Injectable()
export class MockAuthApiService extends AuthApi {
  private readonly accounts: MockAccount[] = [
    {
      audience: 'admin',
      identifiers: ['admin@fitkhao.com'],
      password: 'Admin@123',
      mustChangePassword: false,
      permissions: ADMIN_PERMISSIONS,
      deactivated: false,
      user: {
        id: 'adm-000001',
        displayName: 'FitKhao Admin',
        email: 'admin@fitkhao.com',
        roles: ['ADMIN'],
      },
    },
    {
      audience: 'partner',
      identifiers: ['dr.john@example.com', 'FK-IND-000042'],
      password: 'Temp@1234',
      mustChangePassword: true,
      permissions: ['partner-portal:access'],
      deactivated: false,
      user: {
        id: 'prt-000042',
        displayName: 'Dr. John Doe',
        email: 'dr.john@example.com',
        roles: ['PARTNER'],
        partnerId: 'FK-IND-000042',
        partnerCategory: 'INDIVIDUAL',
        referralCode: 'DRJOHN10',
      },
    },
    {
      audience: 'partner',
      identifiers: ['dr.mehta@apollo.com', 'FK-ORG-000007'],
      password: 'Partner@123',
      mustChangePassword: false,
      permissions: ['partner-portal:access'],
      deactivated: false,
      user: {
        id: 'prt-000007',
        displayName: 'Dr. Anaya Mehta',
        email: 'dr.mehta@apollo.com',
        roles: ['PARTNER'],
        partnerId: 'FK-ORG-000007',
        partnerCategory: 'ORGANISATION',
        referralCode: 'APOLLO-DUMDUM',
      },
    },
    {
      audience: 'partner',
      identifiers: ['old.partner@example.com', 'FK-IND-000003'],
      password: 'Partner@123',
      mustChangePassword: false,
      permissions: ['partner-portal:access'],
      deactivated: true,
      user: {
        id: 'prt-000003',
        displayName: 'Former Partner',
        email: 'old.partner@example.com',
        roles: ['PARTNER'],
        partnerId: 'FK-IND-000003',
        partnerCategory: 'INDIVIDUAL',
        referralCode: 'FORMER5',
      },
    },
  ];

  override login(audience: Audience, req: LoginRequest): Observable<AuthTokenResponse> {
    const id = req.identifier.trim().toLowerCase();
    const account = this.accounts.find(
      (a) => a.audience === audience && a.identifiers.some((x) => x.toLowerCase() === id),
    );

    if (!account || account.password !== req.password) {
      return mockFail({
        status: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'The credentials you entered are incorrect.',
      });
    }
    if (account.deactivated) {
      return mockFail({
        status: 403,
        code: 'AUTH_ACCOUNT_DEACTIVATED',
        message: 'This account has been deactivated. Contact your FitKhao administrator.',
      });
    }
    return mockOk(this.issue(account));
  }

  override refresh(audience: Audience, _req: RefreshRequest): Observable<AuthTokenResponse> {
    const account = this.accounts.find((a) => a.audience === audience);
    if (!account) {
      return mockFail({
        status: 401,
        code: 'AUTH_REFRESH_INVALID',
        message: 'Your session has expired. Please sign in again.',
      });
    }
    return mockOk(this.issue(account));
  }

  override changePassword(
    audience: Audience,
    req: ChangePasswordRequest,
  ): Observable<AuthTokenResponse> {
    const account = this.accounts.find((a) => a.audience === audience);
    if (!account || account.password !== req.currentPassword) {
      return mockFail({
        status: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Your current password is incorrect.',
      });
    }
    const weak =
      req.newPassword.length < 8 ||
      !/[A-Z]/.test(req.newPassword) ||
      !/[a-z]/.test(req.newPassword) ||
      !/[0-9]/.test(req.newPassword);
    if (weak) {
      return mockFail({
        status: 422,
        code: 'AUTH_PASSWORD_POLICY',
        message: 'Your new password does not meet the security policy.',
        fieldErrors: {
          newPassword: [
            'Use at least 8 characters with an uppercase letter, a lowercase letter and a number.',
          ],
        },
      });
    }
    if (req.newPassword === req.currentPassword) {
      return mockFail({
        status: 409,
        code: 'AUTH_PASSWORD_REUSED',
        message: 'Your new password must be different from your current password.',
      });
    }
    account.password = req.newPassword;
    account.mustChangePassword = false;
    return mockOk(this.issue(account));
  }

  override logout(_audience: Audience): Observable<void> {
    return mockOk(undefined as void);
  }

  override me(audience: Audience): Observable<AuthTokenResponse> {
    const account = this.accounts.find((a) => a.audience === audience);
    if (!account) {
      return mockFail({
        status: 401,
        code: 'AUTH_UNAUTHENTICATED',
        message: 'Your session has expired. Please sign in again.',
      });
    }
    return mockOk(this.issue(account));
  }

  private issue(account: MockAccount): AuthTokenResponse {
    const now = Date.now();
    const payload = btoa(
      JSON.stringify({
        sub: account.user.id,
        aud: account.audience,
        iat: now,
        exp: now + 1_800_000,
      }),
    );
    const base: AuthTokenResponse = {
      token: `mock.${payload}.sig`,
      role: account.user.roles[0] ?? '',
      mustChangePassword: account.mustChangePassword,
    };
    if (account.audience === 'partner') {
      return {
        ...base,
        partner: {
          id: account.user.id,
          name: account.user.displayName,
          email: account.user.email,
          partnerId: account.user.partnerId,
          couponCode: account.user.referralCode,
        },
      };
    }
    return {
      ...base,
      admin: {
        id: account.user.id,
        name: account.user.displayName,
        email: account.user.email,
        permissions: account.permissions,
      },
    };
  }
}
