import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { AuthActions } from '@core/auth/store/auth.actions';
import { authFeature } from '@core/auth/store/auth.reducer';
import { AuthTokenResponse, sessionFromToken } from '@core/auth/models/auth.model';
import { PartnerModule } from '../../partner.module';
import { PartnerChangePasswordComponent } from './partner-change-password.component';

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

describe('PartnerChangePasswordComponent', () => {
  let store: Store;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PartnerModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({}),
        StoreModule.forFeature(authFeature),
      ],
    }).compileComponents();
    store = TestBed.inject(Store);
    vi.spyOn(store, 'dispatch');
  });

  it('shows the forced-change notice when mustChangePassword is set', () => {
    store.dispatch(
      AuthActions.loginSuccess({
        audience: 'partner',
        session: sessionFromToken('partner', partnerToken(true)),
      }),
    );
    const fixture = TestBed.createComponent(PartnerChangePasswordComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Password change required');
    expect(fixture.nativeElement.querySelector('.back')).toBeNull();
  });

  it('blocks submit until the new password meets policy and matches', () => {
    const fixture = TestBed.createComponent(PartnerChangePasswordComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      form: { setValue: (v: unknown) => void };
      submit: () => void;
    };
    component.form.setValue({
      currentPassword: 'Temp@1234',
      newPassword: 'weak',
      confirmPassword: 'weak',
    });
    component.submit();
    expect(store.dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: '[Auth] Change Password' }),
    );

    component.form.setValue({
      currentPassword: 'Temp@1234',
      newPassword: 'NewPass123',
      confirmPassword: 'NewPass123',
    });
    component.submit();
    expect(store.dispatch).toHaveBeenCalledWith(
      AuthActions.changePassword({
        audience: 'partner',
        request: { currentPassword: 'Temp@1234', newPassword: 'NewPass123' },
      }),
    );
  });
});
