import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { OrganisationsModule } from '../../organisations.module';
import {
  CreateOrganisationPayload,
  Organisation,
  UpdateOrganisationPayload,
} from '../../models/organisation.model';
import { OrganisationFormComponent } from './organisation-form.component';

const TYPE_OPTIONS = [
  { value: 'otype-000001', label: 'Hospital' },
  { value: 'otype-000002', label: 'Clinic' },
];

const EXISTING: Organisation = {
  id: 'org-000001',
  partnerId: 'FK-ORG-000001',
  name: 'Apollo Hospital — Dum Dum',
  organisationTypeId: 'otype-000001',
  organisationTypeName: 'Hospital',
  referralCode: 'APOLLO-DUMDUM',
  contactPerson: 'Sunita Basu',
  mobile: '+91 9830011111',
  email: 'partnerships@apollo.example.com',
  address: '227 Jessore Road',
  status: 'ACTIVE',
  passwordState: 'OK',
  memberCount: 4,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function createFixture() {
  TestBed.configureTestingModule({
    imports: [
      OrganisationsModule,
      RouterModule.forRoot([]),
      StoreModule.forRoot({}),
      EffectsModule.forRoot([]),
    ],
  });
  const fixture = TestBed.createComponent(OrganisationFormComponent);
  const payloads: Array<CreateOrganisationPayload | UpdateOrganisationPayload> = [];
  fixture.componentInstance.save.subscribe((p) => payloads.push(p));
  return { fixture, payloads };
}

function form(fixture: ReturnType<typeof createFixture>['fixture']) {
  return fixture.componentInstance as unknown as {
    form: { patchValue: (v: unknown) => void };
    submit: () => void;
  };
}

describe('OrganisationFormComponent', () => {
  it('create mode: emits a CreateOrganisationPayload with an upper-cased referral code', () => {
    const { fixture, payloads } = createFixture();
    fixture.componentRef.setInput('mode', 'create');
    fixture.componentRef.setInput('typeOptions', TYPE_OPTIONS);
    fixture.detectChanges();

    form(fixture).form.patchValue({
      name: 'New Centre',
      organisationTypeId: 'otype-000002',
      referralCode: 'new-centre',
      contactPerson: 'Test Person',
      mobile: '+91 9000000009',
      email: 'new@centre.example.com',
      address: '1 Test Road',
      initialPassword: 'Temp@1234',
      confirmPassword: 'Temp@1234',
      status: true,
    });
    form(fixture).submit();

    expect(payloads[0]).toMatchObject({
      name: 'New Centre',
      referralCode: 'NEW-CENTRE',
      initialPassword: 'Temp@1234',
      status: 'ACTIVE',
    });
  });

  it('edit mode: hides password fields and emits an UpdateOrganisationPayload (no code/password)', () => {
    const { fixture, payloads } = createFixture();
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('organisation', EXISTING);
    fixture.componentRef.setInput('typeOptions', TYPE_OPTIONS);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('input[type=password]').length).toBe(0);

    form(fixture).submit();
    expect(payloads[0]).toEqual({
      name: 'Apollo Hospital — Dum Dum',
      organisationTypeId: 'otype-000001',
      contactPerson: 'Sunita Basu',
      mobile: '+91 9830011111',
      email: 'partnerships@apollo.example.com',
      address: '227 Jessore Road',
    });
  });
});
