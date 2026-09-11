import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { AuthActions } from '@core/auth/store/auth.actions';
import { authFeature } from '@core/auth/store/auth.reducer';
import { AdminModule } from '../../admin.module';
import { AdminLoginComponent } from './admin-login.component';

describe('AdminLoginComponent', () => {
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
    vi.spyOn(store, 'dispatch');
  });

  it('does not dispatch login while the form is invalid', () => {
    const fixture = TestBed.createComponent(AdminLoginComponent);
    fixture.detectChanges();
    (fixture.componentInstance as unknown as { submit: () => void }).submit();
    expect(store.dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: '[Auth] Login' }),
    );
  });

  it('dispatches login with the entered credentials', () => {
    const fixture = TestBed.createComponent(AdminLoginComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      form: { setValue: (v: unknown) => void };
      submit: () => void;
    };
    component.form.setValue({ identifier: 'admin@fitkhao.com', password: 'Admin@123' });
    component.submit();
    expect(store.dispatch).toHaveBeenCalledWith(
      AuthActions.login({
        audience: 'admin',
        request: { identifier: 'admin@fitkhao.com', password: 'Admin@123' },
      }),
    );
  });
});
