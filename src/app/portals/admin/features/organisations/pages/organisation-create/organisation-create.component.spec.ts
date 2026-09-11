import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { OrganisationsModule } from '../../organisations.module';
import { OrganisationActions } from '../../store/organisations.actions';
import { OrganisationCreateComponent } from './organisation-create.component';

describe('OrganisationCreateComponent', () => {
  it('dispatches Create when the hosted form emits a valid payload', () => {
    TestBed.configureTestingModule({
      imports: [
        OrganisationsModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
      ],
    });
    const store = TestBed.inject(Store);
    vi.spyOn(store, 'dispatch');

    const fixture = TestBed.createComponent(OrganisationCreateComponent);
    fixture.detectChanges();

    const formCmp = fixture.debugElement.query(By.css('app-organisation-form'))
      .componentInstance as { form: { patchValue: (v: unknown) => void }; submit: () => void };

    formCmp.form.patchValue({
      name: 'Sample Centre',
      organisationTypeId: 'otype-000001',
      referralCode: 'SAMPLE-CTR',
      contactPerson: 'Sample Person',
      mobile: '+91 9000000123',
      email: 'sample@centre.example.com',
      address: '1 Sample Ave',
      initialPassword: 'Temp@1234',
      confirmPassword: 'Temp@1234',
      status: true,
    });
    formCmp.submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: OrganisationActions.create.type }),
    );
  });
});
