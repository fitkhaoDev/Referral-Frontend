import { createSelector } from '@ngrx/store';
import { Audience } from '../models/auth.model';
import { authFeature } from './auth.reducer';
import { AudienceAuthState } from './auth.state';

const { selectAuthState } = authFeature;

export const selectAudienceAuth = (audience: Audience) =>
  createSelector(selectAuthState, (s): AudienceAuthState => s[audience]);

export const selectSession = (audience: Audience) =>
  createSelector(selectAudienceAuth(audience), (a) => a.session);

export const selectIsAuthenticated = (audience: Audience) =>
  createSelector(selectSession(audience), (session) => !!session?.accessToken);

export const selectMustChangePassword = (audience: Audience) =>
  createSelector(selectSession(audience), (session) => session?.mustChangePassword ?? false);

export const selectAuthUser = (audience: Audience) =>
  createSelector(selectSession(audience), (session) => session?.user ?? null);

export const selectPermissions = (audience: Audience) =>
  createSelector(selectSession(audience), (session) => session?.permissions ?? []);

export const selectHasPermission = (audience: Audience, permission: string) =>
  createSelector(selectPermissions(audience), (perms) => perms.includes(permission));

export const selectAuthStatus = (audience: Audience) =>
  createSelector(selectAudienceAuth(audience), (a) => a.status);

export const selectAuthError = (audience: Audience) =>
  createSelector(selectAudienceAuth(audience), (a) => a.error);

export const selectAuthBusy = (audience: Audience) =>
  createSelector(
    selectAuthStatus(audience),
    (status) => status === 'authenticating' || status === 'changing-password',
  );
