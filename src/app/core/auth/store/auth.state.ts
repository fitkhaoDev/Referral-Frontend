import { ApiError } from '../../models/api.model';
import { AuthSession } from '../models/auth.model';

export type AuthStatus =
  | 'idle'
  | 'authenticating'
  | 'authenticated'
  | 'changing-password'
  | 'error';

export interface AudienceAuthState {
  readonly session: AuthSession | null;
  readonly status: AuthStatus;
  readonly error: ApiError | null;
}

export interface AuthState {
  readonly admin: AudienceAuthState;
  readonly partner: AudienceAuthState;
}

const emptyAudience: AudienceAuthState = { session: null, status: 'idle', error: null };

/**
 * Starts empty. Sessions are loaded from storage by the `Hydrate` action dispatched
 * from an `APP_INITIALIZER`, which completes before the router runs — so guards see
 * the correct session on the first navigation.
 */
export const initialAuthState: AuthState = {
  admin: emptyAudience,
  partner: emptyAudience,
};
