import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { firstValueFrom, isObservable } from 'rxjs';
import { authFeature } from '../store/auth.reducer';
import { AuthActions } from '../store/auth.actions';
import { AuthTokenResponse, sessionFromToken } from '../models/auth.model';
import { AdminAuthGuard } from './admin-auth.guard';

const token: AuthTokenResponse = {
  accessToken: 'a',
  tokenType: 'Bearer',
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  user: { id: 'adm-1', displayName: 'A', email: 'a@fitkhao.com', roles: ['ADMIN'] },
  mustChangePassword: false,
  permissions: ['partner:read'],
};

describe('AdminAuthGuard', () => {
  let guard: AdminAuthGuard;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}), StoreModule.forFeature(authFeature)],
    });
    guard = TestBed.inject(AdminAuthGuard);
    store = TestBed.inject(Store);
  });

  async function resolve(url: string) {
    const result = guard.canActivate({} as never, { url } as RouterStateSnapshot);
    return isObservable(result) ? firstValueFrom(result) : result;
  }

  it('redirects an unauthenticated visitor to /admin/login with returnUrl', async () => {
    const result = await resolve('/admin/partners');
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toContain(
      'returnUrl=%2Fadmin%2Fpartners',
    );
  });

  it('allows an authenticated admin', async () => {
    store.dispatch(AuthActions.loginSuccess({ audience: 'admin', session: sessionFromToken('admin', token) }));
    expect(await resolve('/admin/partners')).toBe(true);
  });
});
