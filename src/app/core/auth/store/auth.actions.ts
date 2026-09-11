import { createActionGroup, props } from '@ngrx/store';
import { ApiError } from '../../models/api.model';
import {
  Audience,
  AuthSession,
  ChangePasswordRequest,
  LoginRequest,
} from '../models/auth.model';

export type LogoutReason = 'user' | 'expired' | 'forbidden' | 'audience-mismatch';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Hydrate': props<{ admin: AuthSession | null; partner: AuthSession | null }>(),

    'Login': props<{ audience: Audience; request: LoginRequest }>(),
    'Login Success': props<{ audience: Audience; session: AuthSession }>(),
    'Login Failure': props<{ audience: Audience; error: ApiError }>(),

    'Change Password': props<{ audience: Audience; request: ChangePasswordRequest }>(),
    'Change Password Success': props<{ audience: Audience; session: AuthSession }>(),
    'Change Password Failure': props<{ audience: Audience; error: ApiError }>(),

    'Refresh Session': props<{ audience: Audience }>(),
    'Refresh Session Success': props<{ audience: Audience; session: AuthSession }>(),
    'Refresh Session Failure': props<{ audience: Audience; error: ApiError }>(),

    'Logout': props<{ audience: Audience; reason?: LogoutReason }>(),
    'Session Cleared': props<{ audience: Audience; reason?: LogoutReason }>(),

    'Error Cleared': props<{ audience: Audience }>(),
  },
});
