import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '@core/models/api.model';
import { ORGANISATION_SEED } from '../../_fixtures/organisation-catalog';
import { MockOrganisationMemberApiService } from './mock-organisation-member-api.service';

const query = (over: Partial<Parameters<MockOrganisationMemberApiService['list']>[0]> = {}) => ({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
  search: '',
  filters: {},
  ...over,
});

describe('MockOrganisationMemberApiService', () => {
  let api: MockOrganisationMemberApiService;
  const apollo = ORGANISATION_SEED[0];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockOrganisationMemberApiService] });
    api = TestBed.inject(MockOrganisationMemberApiService);
  });

  it('lists members with denormalised organisation name + referral code', async () => {
    const page = await firstValueFrom(api.list(query({ filters: { organisationId: apollo.id } })));
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((m) => m.organisationReferralCode === apollo.referralCode)).toBe(true);
  });

  it('filters by organisation and status together', async () => {
    const page = await firstValueFrom(
      api.list(query({ filters: { organisationId: apollo.id, status: 'ACTIVE' } })),
    );
    expect(page.items.every((m) => m.status === 'ACTIVE' && m.organisationId === apollo.id)).toBe(
      true,
    );
  });

  it('rejects an unknown organisation on create', async () => {
    await expect(
      firstValueFrom(
        api.create({
          organisationId: 'org-does-not-exist',
          name: 'Dr. Ghost',
          mobile: '+91 9000000000',
          email: 'ghost@org.example.com',
          status: 'ACTIVE',
        }),
      ),
    ).rejects.toMatchObject({ status: 404, code: 'ORGANISATION_NOT_FOUND' });
  });

  it('rejects a duplicate email within the same organisation', async () => {
    const existing = (await firstValueFrom(api.list(query({ filters: { organisationId: apollo.id } }))))
      .items[0];
    await expect(
      firstValueFrom(
        api.create({
          organisationId: apollo.id,
          name: 'Dr. Clash',
          mobile: '+91 9000000001',
          email: existing.email,
          status: 'ACTIVE',
        }),
      ),
    ).rejects.toMatchObject({ status: 409, code: 'ORGANISATION_MEMBER_EMAIL_TAKEN' });
  });

  it('creates a member and prepends it', async () => {
    const created = await firstValueFrom(
      api.create({
        organisationId: apollo.id,
        name: 'Dr. Fresh',
        specialisation: 'Dermatology',
        mobile: '+91 9000000002',
        email: 'fresh@org.example.com',
        status: 'ACTIVE',
      }),
    );
    expect(created.organisationReferralCode).toBe(apollo.referralCode);
    const first = (await firstValueFrom(api.list(query()))).items[0];
    expect(first.id).toBe(created.id);
  });
});
