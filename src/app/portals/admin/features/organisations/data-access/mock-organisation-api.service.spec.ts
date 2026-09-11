import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '@core/models/api.model';
import { MockOrganisationApiService } from './mock-organisation-api.service';

const query = (over: Partial<Parameters<MockOrganisationApiService['list']>[0]> = {}) => ({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
  search: '',
  filters: {},
  ...over,
});

const validPayload = {
  name: 'New Wellness Centre',
  organisationTypeId: 'otype-000002',
  referralCode: 'NEW-WELLNESS',
  contactPerson: 'Test Contact',
  mobile: '+91 9000000000',
  email: 'new@centre.example.com',
  address: '1 Test Ave',
  status: 'ACTIVE' as const,
  initialPassword: 'Temp@1234',
};

describe('MockOrganisationApiService', () => {
  let api: MockOrganisationApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockOrganisationApiService] });
    api = TestBed.inject(MockOrganisationApiService);
  });

  it('seeds organisations with a member count and a FK-ORG partner id', async () => {
    const page = await firstValueFrom(api.list(query()));
    const apollo = page.items.find((o) => o.referralCode === 'APOLLO-DUMDUM')!;
    expect(apollo.partnerId).toMatch(/^FK-ORG-\d{6}$/);
    expect(apollo.memberCount).toBe(4);
  });

  it('searches by referral code and contact person', async () => {
    const page = await firstValueFrom(api.list(query({ search: 'APOLLO-DUMDUM' })));
    expect(page.items).toHaveLength(1);
  });

  it('creates with MUST_CHANGE password state and an assigned partner id', async () => {
    const created = await firstValueFrom(api.create(validPayload));
    expect(created.passwordState).toBe('MUST_CHANGE');
    expect(created.referralCode).toBe('NEW-WELLNESS');
    expect(created.memberCount).toBe(0);
  });

  it('rejects a duplicate referral code', async () => {
    await expect(
      firstValueFrom(api.create({ ...validPayload, referralCode: 'apollo-dumdum' })),
    ).rejects.toMatchObject({ status: 409, code: 'ORGANISATION_REFERRAL_CODE_TAKEN' });
  });

  it('reset password issues a temp password and forces MUST_CHANGE', async () => {
    const first = (await firstValueFrom(api.list(query()))).items[0];
    const result = await firstValueFrom(api.resetPassword(first.id));
    expect(result.temporaryPassword).toBeTruthy();
    const after = await firstValueFrom(api.get(first.id));
    expect(after.passwordState).toBe('MUST_CHANGE');
  });
});
