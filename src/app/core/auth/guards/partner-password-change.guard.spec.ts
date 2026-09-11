import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { firstValueFrom, isObservable } from 'rxjs';
import { AuthActions } from '../store/auth.actions';
import { AuthTokenResponse, sessionFromToken } from '../models/auth.model';
import { authFeature } from '../store/auth.reducer';
import { PartnerPasswordChangeGuard } from './partner-password-change.guard';

function partnerToken(mustChangePassword: boolean): AuthTokenResponse {
  return {
    accessToken: 'p',
    tokenType: 'Bearer',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    user: { id: 'prt-1', displayName: 'P', email: 'p@x.com', roles: ['PARTNER'] },
    mustChangePassword,
    permissions: [],
  };
}

describe('PartnerPasswordChangeGuard', () => {
  let guard: PartnerPasswordChangeGuard;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}), StoreModule.forFeature(authFeature)],
    });
    guard = TestBed.inject(PartnerPasswordChangeGuard);
    store = TestBed.inject(Store);
  });

  async function resolve() {
    const result = guard.canActivate();
    return isObservable(result) ? firstValueFrom(result) : result;
  }

  it('redirects to change-password while the flag is set', async () => {
    store.dispatch(
      AuthActions.loginSuccess({ audience: 'partner', session: sessionFromToken('partner', partnerToken(true)) }),
    );
    const result = await resolve();
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/partner/change-password');
  });

  it('allows navigation once the flag is cleared', async () => {
    store.dispatch(
      AuthActions.loginSuccess({ audience: 'partner', session: sessionFromToken('partner', partnerToken(false)) }),
    );
    expect(await resolve()).toBe(true);
  });
});
