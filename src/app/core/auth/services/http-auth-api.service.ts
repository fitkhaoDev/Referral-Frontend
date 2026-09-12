import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { APP_CONFIG } from '../../config/app-config.token';
import {
  Audience,
  AuthTokenResponse,
  ChangePasswordRequest,
  LoginRequest,
  RefreshRequest,
} from '../models/auth.model';
import { AuthApi } from './auth-api.abstract';

/** Real backend implementation of {@link AuthApi}. Selected when `environment.useMockApi` is false. */
@Injectable()
export class HttpAuthApiService extends AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_CONFIG).apiBaseUrl;

  private url(audience: Audience, path: string): string {
    return `${this.base}/${audience}/auth/${path}`;
  }

  override login(audience: Audience, req: LoginRequest): Observable<AuthTokenResponse> {
    return this.http
      .post<{ data: AuthTokenResponse }>(this.url(audience, 'login'), req)
      .pipe(map((res) => res.data));
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
