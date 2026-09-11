import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { AuthActions } from '@core/auth/store/auth.actions';
import { authFeature } from '@core/auth/store/auth.reducer';
import { AuthTokenResponse, sessionFromToken } from '@core/auth/models/auth.model';
import { AdminModule } from '../../admin.module';
import { AdminShellComponent } from './admin-shell.component';

function adminToken(permissions: string[]): AuthTokenResponse {
  return {
    accessToken: 'a',
    tokenType: 'Bearer',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    user: { id: 'adm-1', displayName: 'Ada Admin', email: 'ada@fitkhao.com', roles: ['ADMIN'] },
    mustChangePassword: false,
    permissions,
  };
}

describe('AdminShellComponent', () => {
  let store: Store;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({}),
        StoreModule.forFeature(authFeature),
      ],
    }).compileComponents();
    store = TestBed.inject(Store);
  });

  it('only shows nav items the admin has permission for', () => {
    store.dispatch(
      AuthActions.loginSuccess({
        audience: 'admin',
        session: sessionFromToken('admin', adminToken(['partner:read'])),
      }),
    );
    const fixture = TestBed.createComponent(AdminShellComponent);
    fixture.detectChanges();
    const links = Array.from(fixture.nativeElement.querySelectorAll('.sidenav a')).map((a) =>
      (a as HTMLElement).textContent?.trim(),
    );
    expect(links).toContain('Dashboard');
    expect(links).toContain('Partners');
    expect(links).not.toContain('Commissions');
    expect(links).not.toContain('Analytics');
  });
});
