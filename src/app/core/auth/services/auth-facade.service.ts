import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiError } from '../../models/api.model';
import {
  Audience,
  AuthSession,
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
} from '../models/auth.model';
import { AuthActions, LogoutReason } from '../store/auth.actions';
import {
  selectAuthBusy,
  selectAuthError,
  selectAuthUser,
  selectIsAuthenticated,
  selectMustChangePassword,
  selectPermissions,
  selectSession,
} from '../store/auth.selectors';

/**
 * Thin component-facing surface over the auth NgRx slice. Components and shells
 * depend on this instead of touching the store directly.
 */
@Injectable({ providedIn: 'root' })
export class AuthFacadeService {
  private readonly store = inject(Store);

  session(audience: Audience): Signal<AuthSession | null> {
    return this.store.selectSignal(selectSession(audience));
  }

  user(audience: Audience): Signal<AuthUser | null> {
    return this.store.selectSignal(selectAuthUser(audience));
  }

  isAuthenticated(audience: Audience): Signal<boolean> {
    return this.store.selectSignal(selectIsAuthenticated(audience));
  }

  mustChangePassword(audience: Audience): Signal<boolean> {
    return this.store.selectSignal(selectMustChangePassword(audience));
  }

  permissions(audience: Audience): Signal<readonly string[]> {
    return this.store.selectSignal(selectPermissions(audience));
  }

  busy(audience: Audience): Signal<boolean> {
    return this.store.selectSignal(selectAuthBusy(audience));
  }

  error(audience: Audience): Signal<ApiError | null> {
    return this.store.selectSignal(selectAuthError(audience));
  }

  login(audience: Audience, request: LoginRequest): void {
    this.store.dispatch(AuthActions.login({ audience, request }));
  }

  changePassword(audience: Audience, request: ChangePasswordRequest): void {
    this.store.dispatch(AuthActions.changePassword({ audience, request }));
  }

  logout(audience: Audience, reason: LogoutReason = 'user'): void {
    this.store.dispatch(AuthActions.logout({ audience, reason }));
  }

  clearError(audience: Audience): void {
    this.store.dispatch(AuthActions.errorCleared({ audience }));
  }
}
