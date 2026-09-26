import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { APP_CONFIG } from '../../config/app-config.token';
import {
  Audience,
  AuthTokenResponse,
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  RefreshRequest,
} from '../models/auth.model';
import { AuthApi } from './auth-api.abstract';

/** Wire format returned by the unified-login backend endpoint. */
interface UnifiedLoginData {
  readonly token: string;
  readonly role: string;
  readonly mustChangePassword?: boolean;
  readonly partner?: {
    readonly id: unknown;
    readonly name?: string;
    readonly email?: string;
    readonly partnerId?: string;
    readonly couponCode?: string;
  };
  readonly admin?: {
    readonly id: unknown;
    readonly name?: string;
    readonly email?: string;
    readonly permissions?: readonly string[];
  };
}

const AUDIENCE_ROLE: Record<Audience, string> = {
  partner: 'referral_partner',
  admin: 'admin',
};

/** Real backend implementation of {@link AuthApi}. Selected when `environment.useMockApi` is false. */
@Injectable()
export class HttpAuthApiService extends AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_CONFIG).apiBaseUrl;

  private url(audience: Audience, path: string): string {
    // Backend uses the shortened `adm` prefix for admin routes; other audiences
    // map 1:1 to their audience name.
    const audiencePath = audience === 'admin' ? 'adm' : audience;
    return `${this.base}/${audiencePath}/auth/${path}`;
  }

  /** Maps the unified-login wire format to the frontend {@link AuthTokenResponse} shape. */
  private mapLogin(audience: Audience, data: UnifiedLoginData): AuthTokenResponse {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    let user: AuthUser;
    let permissions: readonly string[];

    if (audience === 'partner') {
      user = {
        id: String(data.partner?.id ?? ''),
        displayName: data.partner?.name ?? '',
        email: data.partner?.email ?? '',
        roles: [data.role],
        partnerId: data.partner?.partnerId,
        referralCode: data.partner?.couponCode,
      };
      permissions = [];
    } else {
      user = {
        id: String(data.admin?.id ?? ''),
        displayName: data.admin?.name ?? '',
        email: data.admin?.email ?? '',
        roles: [data.role],
      };
      permissions = data.admin?.permissions ?? [];
    }

    return {
      accessToken: data.token,
      tokenType: 'Bearer',
      expiresAt,
      user,
      mustChangePassword: data.mustChangePassword ?? false,
      permissions,
    };
  }

  override login(audience: Audience, req: LoginRequest): Observable<AuthTokenResponse> {
    return this.http
      .post<{ data: UnifiedLoginData }>(`${this.base}/auth/unified-login`, {
        userId: req.identifier,
        password: req.password,
        role: AUDIENCE_ROLE[audience],
      })
      .pipe(map((res) => this.mapLogin(audience, res.data)));
  }

  override refresh(audience: Audience, req: RefreshRequest): Observable<AuthTokenResponse> {
    return this.http
      .post<{ data: AuthTokenResponse }>(this.url(audience, 'refresh'), req)
      .pipe(map((res) => res.data));
  }

  override changePassword(
    audience: Audience,
    req: ChangePasswordRequest,
  ): Observable<AuthTokenResponse> {
    return this.http
      .post<{ data: AuthTokenResponse }>(this.url(audience, 'change-password'), req)
      .pipe(map((res) => res.data));
  }

  override logout(audience: Audience): Observable<void> {
    return this.http.post<void>(this.url(audience, 'logout'), {});
  }

  override me(audience: Audience): Observable<AuthTokenResponse> {
    return this.http
      .get<{ data: AuthTokenResponse }>(this.url(audience, 'me'))
      .pipe(map((res) => res.data));
  }
}
