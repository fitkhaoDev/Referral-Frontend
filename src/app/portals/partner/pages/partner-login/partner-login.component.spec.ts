import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { AuthActions } from '@core/auth/store/auth.actions';
import { authFeature } from '@core/auth/store/auth.reducer';
import { PartnerModule } from '../../partner.module';
import { PartnerLoginComponent } from './partner-login.component';

describe('PartnerLoginComponent', () => {
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

  it('accepts a Partner ID as the identifier (no email validator)', () => {
    const fixture = TestBed.createComponent(PartnerLoginComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      form: { setValue: (v: unknown) => void };
      submit: () => void;
    };
    component.form.setValue({ identifier: 'FK-ORG-000007', password: 'Partner@123' });
    component.submit();
    expect(store.dispatch).toHaveBeenCalledWith(
      AuthActions.login({
        audience: 'partner',
        request: { identifier: 'FK-ORG-000007', password: 'Partner@123' },
      }),
    );
  });
});
