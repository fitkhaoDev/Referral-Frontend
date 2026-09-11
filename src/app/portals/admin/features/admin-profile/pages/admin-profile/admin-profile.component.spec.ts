import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { AuthActions } from '@core/auth/store/auth.actions';
import { authFeature } from '@core/auth/store/auth.reducer';
import { AuthSession } from '@core/auth/models/auth.model';
import { AdminProfileModule } from '../../admin-profile.module';
import { AdminProfileComponent } from './admin-profile.component';

const SESSION: AuthSession = {
  audience: 'admin',
  accessToken: 't',
  tokenType: 'Bearer',
  expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  mustChangePassword: false,
  permissions: ['partner:read', 'commission:read'],
  user: { id: 'adm-1', displayName: 'FitKhao Admin', email: 'admin@fitkhao.com', roles: ['ADMIN'] },
};

function setup() {
  TestBed.configureTestingModule({
    imports: [
      AdminProfileModule,
      RouterModule.forRoot([]),
      StoreModule.forRoot({}),
      StoreModule.forFeature(authFeature),
      EffectsModule.forRoot([]),
    ],
  });
  const store = TestBed.inject(Store);
  store.dispatch(AuthActions.hydrate({ admin: SESSION, partner: null }));
  return { store };
}

describe('AdminProfileComponent', () => {
  it('shows the signed-in identity and permission list', () => {
    setup();
    const fixture = TestBed.createComponent(AdminProfileComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('FitKhao Admin');
    expect(text).toContain('admin@fitkhao.com');
    expect(fixture.nativeElement.querySelectorAll('.perms li').length).toBe(2);
  });

  it('dispatches Change Password for the admin audience on submit', () => {
    const { store } = setup();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(AdminProfileComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      form: { setValue: (v: unknown) => void };
      submit: () => void;
    };
    component.form.setValue({
      currentPassword: 'Admin@123',
      newPassword: 'NewPass@99',
      confirmPassword: 'NewPass@99',
    });
    component.submit();
    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.changePassword({
        audience: 'admin',
        request: { currentPassword: 'Admin@123', newPassword: 'NewPass@99' },
      }),
    );
  });

  it('does not submit an invalid form', () => {
    const { store } = setup();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(AdminProfileComponent);
    fixture.detectChanges();
    (fixture.componentInstance as unknown as { submit: () => void }).submit();
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: AuthActions.changePassword.type }),
    );
  });
});
