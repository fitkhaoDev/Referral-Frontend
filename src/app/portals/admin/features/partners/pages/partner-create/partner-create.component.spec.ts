import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { PartnersModule } from '../../partners.module';
import { PartnerActions } from '../../store/partners.actions';
import { PartnerCreateComponent } from './partner-create.component';

describe('PartnerCreateComponent', () => {
  it('dispatches Create when the hosted form emits a valid payload', () => {
    TestBed.configureTestingModule({
      imports: [
        PartnersModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
      ],
    });
    const store = TestBed.inject(Store);
    vi.spyOn(store, 'dispatch');

    const fixture = TestBed.createComponent(PartnerCreateComponent);
    fixture.detectChanges();

    const formCmp = fixture.debugElement.query(By.css('app-partner-form')).componentInstance as {
      form: { patchValue: (v: unknown) => void };
      submit: () => void;
    };

    formCmp.form.patchValue({
      name: 'Dr. Sample',
      partnerTypeId: 'ptype-000001',
      mobile: '+91 9000000123',
      email: 'sample.partner@example.com',
      referralCode: 'SAMPLE10',
      initialPassword: 'Temp@1234',
      confirmPassword: 'Temp@1234',
      status: true,
    });
    formCmp.submit();

    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: PartnerActions.create.type }),
    );
  });
});
