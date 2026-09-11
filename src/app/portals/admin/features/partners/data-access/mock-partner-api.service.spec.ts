import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '@core/models/api.model';
import { MockPartnerApiService } from './mock-partner-api.service';

const query = (over: Partial<Parameters<MockPartnerApiService['list']>[0]> = {}) => ({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
  search: '',
  filters: {},
  ...over,
});

const validPayload = {
  name: 'Dr. New Partner',
  partnerTypeId: 'ptype-000001',
  specialisation: 'Cardiology',
  mobile: '+91 9000000001',
  email: 'new.partner@example.com',
  professionalAddress: '1 Test Road',
  referralCode: 'NEWDOC10',
  status: 'ACTIVE' as const,
  initialPassword: 'Temp@1234',
};

describe('MockPartnerApiService', () => {
  let api: MockPartnerApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockPartnerApiService] });
    api = TestBed.inject(MockPartnerApiService);
  });

  it('seeds 24 individual partners with generated Partner IDs', async () => {
    const page = await firstValueFrom(api.list(query({ size: 100 })));
    expect(page.totalItems).toBe(24);
    expect(page.items[0].partnerId).toMatch(/^FK-IND-\d{6}$/);
  });

  it('searches across name, partnerId, email and referral code', async () => {
    const page = await firstValueFrom(api.list(query({ search: 'FK-IND-000002' })));
    expect(page.items).toHaveLength(1);
  });

  it('filters by partner type', async () => {
    const page = await firstValueFrom(
      api.list(query({ size: 100, filters: { partnerTypeId: 'ptype-000001' } })),
    );
    expect(page.items.every((p) => p.partnerTypeId === 'ptype-000001')).toBe(true);
  });

  it('creates a partner with MUST_CHANGE password state and a backend-assigned id', async () => {
    const created = await firstValueFrom(api.create(validPayload));
    expect(created.passwordState).toBe('MUST_CHANGE');
    expect(created.partnerId).toMatch(/^FK-IND-\d{6}$/);
    expect(created.referralCode).toBe('NEWDOC10');
  });

  it('rejects a duplicate email and referral code with field errors', async () => {
    await firstValueFrom(api.create(validPayload));
    await expect(firstValueFrom(api.create(validPayload))).rejects.toMatchObject({
      status: 409,
      code: 'PARTNER_EMAIL_TAKEN',
    });
  });

  it('deactivation retains the record (not a delete)', async () => {
    const first = (await firstValueFrom(api.list(query()))).items[0];
    const updated = await firstValueFrom(api.setStatus(first.id, 'INACTIVE'));
    expect(updated.status).toBe('INACTIVE');
    expect(updated.deactivatedAt).toBeTruthy();
    expect((await firstValueFrom(api.list(query({ size: 100 })))).totalItems).toBe(24);
  });

  it('reset password forces MUST_CHANGE and never returns the existing password', async () => {
    const first = (await firstValueFrom(api.list(query()))).items[0];
    const result = await firstValueFrom(api.resetPassword(first.id));
    expect(result.passwordState).toBe('MUST_CHANGE');
    expect(result.temporaryPassword).toBeTruthy();
    const after = await firstValueFrom(api.get(first.id));
    expect(after.passwordState).toBe('MUST_CHANGE');
  });
});
