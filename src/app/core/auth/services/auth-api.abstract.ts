import { Observable } from 'rxjs';
import {
  Audience,
  AuthTokenResponse,
  ChangePasswordRequest,
  LoginRequest,
  RefreshRequest,
} from '../models/auth.model';

/**
 * Authentication contract — one method per backend endpoint.
 *
 * Admin and Partner are ISOLATED: each `audience` maps to a distinct URL prefix and
 * a distinct token. A token issued for one audience is rejected by the other, both
 * on the client (guards) and, authoritatively, on the backend.
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * login            POST  /api/{audience}/auth/login
 *   req  LoginRequest { identifier, password }
 *   res  200 AuthTokenResponse
 *   err  401 AUTH_INVALID_CREDENTIALS
 *        403 AUTH_ACCOUNT_DEACTIVATED   (partner deactivated by admin — cannot log in)
 *        429 AUTH_RATE_LIMITED
 *
 * refresh          POST  /api/{audience}/auth/refresh
 *   req  RefreshRequest { refreshToken }
 *   res  200 AuthTokenResponse
 *   err  401 AUTH_REFRESH_INVALID
 *
 * changePassword   POST  /api/{audience}/auth/change-password
 *   req  ChangePasswordRequest { currentPassword, newPassword }
 *   res  200 AuthTokenResponse   (fresh session; mustChangePassword=false)
 *   err  401 AUTH_INVALID_CREDENTIALS      (currentPassword wrong)
 *        422 AUTH_PASSWORD_POLICY          (fieldErrors.newPassword[])
 *        409 AUTH_PASSWORD_REUSED
 *   note Used both for the forced first-login change and voluntary changes.
 *
 * logout           POST  /api/{audience}/auth/logout
 *   res  204
 *   note Best-effort server-side token revocation; client clears local session regardless.
 *
 * me               GET   /api/{audience}/auth/me
 *   res  200 AuthTokenResponse   (no new tokens; used to re-hydrate user + flags)
 *   err  401 AUTH_UNAUTHENTICATED
 *
 * Permissions: login/refresh are public; changePassword requires the current bearer;
 * `me` requires a valid bearer for the matching audience.
 */
export abstract class AuthApi {
  abstract login(audience: Audience, req: LoginRequest): Observable<AuthTokenResponse>;
  abstract refresh(audience: Audience, req: RefreshRequest): Observable<AuthTokenResponse>;
  abstract changePassword(
    audience: Audience,
    req: ChangePasswordRequest,
  ): Observable<AuthTokenResponse>;
  abstract logout(audience: Audience): Observable<void>;
  abstract me(audience: Audience): Observable<AuthTokenResponse>;
}
