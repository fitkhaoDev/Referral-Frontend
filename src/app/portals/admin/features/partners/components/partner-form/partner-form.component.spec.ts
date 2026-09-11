import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { PartnersModule } from '../../partners.module';
import { CreatePartnerPayload, Partner, UpdatePartnerPayload } from '../../models/partner.model';
import { PartnerFormComponent } from './partner-form.component';

const OPTIONS = [
  { value: 'ptype-000001', label: 'Doctor' },
  { value: 'ptype-000002', label: 'Nutritionist' },
];

const EXISTING: Partner = {
  id: 'partner-000001',
  partnerId: 'FK-IND-000001',
  name: 'Dr. John Doe',
  partnerTypeId: 'ptype-000001',
  partnerTypeName: 'Doctor',
  partnerTypeCode: 'DOCTOR',
  specialisation: 'Cardiology',
  mobile: '+91 9000000001',
  email: 'john@example.com',
  professionalAddress: '1 Road',
  referralCode: 'JOHNDOC10',
  status: 'ACTIVE',
  passwordState: 'OK',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function createFixture() {
  TestBed.configureTestingModule({
    imports: [PartnersModule, RouterModule.forRoot([]), StoreModule.forRoot({}), EffectsModule.forRoot([])],
  });
  const fixture = TestBed.createComponent(PartnerFormComponent);
  const payloads: Array<CreatePartnerPayload | UpdatePartnerPayload> = [];
  fixture.componentInstance.save.subscribe((p) => payloads.push(p));
  return { fixture, payloads };
}

function form(fixture: ReturnType<typeof createFixture>['fixture']) {
  return fixture.componentInstance as unknown as {
    form: { patchValue: (v: unknown) => void };
    submit: () => void;
  };
}

describe('PartnerFormComponent', () => {
  it('create mode: emits a CreatePartnerPayload with an upper-cased referral code', () => {
    const { fixture, payloads } = createFixture();
    fixture.componentRef.setInput('mode', 'create');
    fixture.componentRef.setInput('partnerTypeOptions', OPTIONS);
    fixture.detectChanges();

    form(fixture).form.patchValue({
      name: 'Dr. New',
      partnerTypeId: 'ptype-000001',
      mobile: '+91 9000000009',
      email: 'new@example.com',
      referralCode: 'newdoc12',
      initialPassword: 'Temp@1234',
      confirmPassword: 'Temp@1234',
      status: true,
    });
    form(fixture).submit();

    expect(payloads[0]).toMatchObject({
      name: 'Dr. New',
      referralCode: 'NEWDOC12',
      initialPassword: 'Temp@1234',
      status: 'ACTIVE',
    });
  });

  it('create mode: blocks submit when passwords do not match', () => {
    const { fixture, payloads } = createFixture();
    fixture.componentRef.setInput('mode', 'create');
    fixture.componentRef.setInput('partnerTypeOptions', OPTIONS);
    fixture.detectChanges();

    form(fixture).form.patchValue({
      name: 'Dr. New',
      partnerTypeId: 'ptype-000001',
      mobile: '+91 9000000009',
      email: 'new@example.com',
      referralCode: 'NEWDOC12',
      initialPassword: 'Temp@1234',
      confirmPassword: 'Different1',
    });
    form(fixture).submit();
    expect(payloads).toHaveLength(0);
  });

  it('edit mode: hides password fields and emits an UpdatePartnerPayload', () => {
    const { fixture, payloads } = createFixture();
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('partner', EXISTING);
    fixture.componentRef.setInput('partnerTypeOptions', OPTIONS);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('input[type=password]').length).toBe(0);

    form(fixture).submit();
    expect(payloads[0]).toEqual({
      name: 'Dr. John Doe',
      partnerTypeId: 'ptype-000001',
      specialisation: 'Cardiology',
      mobile: '+91 9000000001',
      email: 'john@example.com',
      professionalAddress: '1 Road',
    });
  });
});
