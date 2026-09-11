import { createFeature, createReducer, on } from '@ngrx/store';
import { Audience } from '../models/auth.model';
import { AuthActions } from './auth.actions';
import { AudienceAuthState, AuthState, initialAuthState } from './auth.state';

function patch(state: AuthState, audience: Audience, next: Partial<AudienceAuthState>): AuthState {
  return { ...state, [audience]: { ...state[audience], ...next } };
}

export const AUTH_FEATURE_KEY = 'auth';

export const authFeature = createFeature({
  name: AUTH_FEATURE_KEY,
  reducer: createReducer(
    initialAuthState,

    on(AuthActions.hydrate, (s, { admin, partner }) => ({
      admin: { session: admin, status: admin ? 'authenticated' : 'idle', error: null },
      partner: { session: partner, status: partner ? 'authenticated' : 'idle', error: null },
    })),

    on(AuthActions.login, (s, { audience }) =>
      patch(s, audience, { status: 'authenticating', error: null }),
    ),
    on(AuthActions.loginSuccess, (s, { audience, session }) =>
      patch(s, audience, { session, status: 'authenticated', error: null }),
    ),
    on(AuthActions.loginFailure, (s, { audience, error }) =>
      patch(s, audience, { session: null, status: 'error', error }),
    ),

    on(AuthActions.changePassword, (s, { audience }) =>
      patch(s, audience, { status: 'changing-password', error: null }),
    ),
    on(AuthActions.changePasswordSuccess, (s, { audience, session }) =>
      patch(s, audience, { session, status: 'authenticated', error: null }),
    ),
    on(AuthActions.changePasswordFailure, (s, { audience, error }) =>
      patch(s, audience, { status: 'error', error }),
    ),

    on(AuthActions.refreshSessionSuccess, (s, { audience, session }) =>
      patch(s, audience, { session, status: 'authenticated' }),
    ),

    on(AuthActions.sessionCleared, (s, { audience }) =>
      patch(s, audience, { session: null, status: 'idle', error: null }),
    ),

    on(AuthActions.errorCleared, (s, { audience }) => patch(s, audience, { error: null })),
  ),
});
