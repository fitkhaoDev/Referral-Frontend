import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_PAGE_SIZE } from '@core/models/api.model';
import { MockWithdrawalApiService } from './mock-withdrawal-api.service';

const query = (over: Partial<Parameters<MockWithdrawalApiService['list']>[0]> = {}) => ({
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  sort: [],
  search: '',
  filters: {},
  ...over,
});

describe('MockWithdrawalApiService', () => {
  let api: MockWithdrawalApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockWithdrawalApiService] });
    api = TestBed.inject(MockWithdrawalApiService);
  });

  it('exposes a backend-provided policy (no hardcoded thresholds in the UI)', async () => {
    const policy = await firstValueFrom(api.getPolicy());
    expect(policy.minAmount.minorUnits).toBeGreaterThan(0);
    expect(policy.maxRequestsPerCalendarMonth).toBeGreaterThan(0);
    expect(policy.currency).toBe('INR');
  });

  it('every row carries an allowedActions list consistent with its status', async () => {
    const page = await firstValueFrom(api.list(query({ size: 100 })));
    expect(page.totalItems).toBeGreaterThan(0);
    for (const w of page.items) {
      if (w.status === 'REQUESTED') expect(w.allowedActions).toEqual(['APPROVE', 'REJECT']);
      if (w.status === 'PAID' || w.status === 'REJECTED' || w.status === 'CANCELLED') {
        expect(w.allowedActions).toEqual([]);
      }
    }
  });

  it('approve moves a REQUESTED withdrawal to APPROVED and refreshes allowedActions', async () => {
    const page = await firstValueFrom(api.list(query({ size: 100, filters: { status: 'REQUESTED' } })));
    const target = page.items[0];
    const updated = await firstValueFrom(api.approve(target.id));
    expect(updated.status).toBe('APPROVED');
    expect(updated.allowedActions).toEqual(['MARK_PROCESSING']);
    expect(updated.decidedAt).toBeTruthy();
  });

  it('rejects an invalid transition with 409', async () => {
    const page = await firstValueFrom(api.list(query({ size: 100, filters: { status: 'PAID' } })));
    await expect(firstValueFrom(api.approve(page.items[0].id))).rejects.toMatchObject({
      code: 'WITHDRAWAL_TRANSITION_NOT_ALLOWED',
      status: 409,
    });
  });

  it('reject requires a reason (422 with fieldErrors)', async () => {
    const page = await firstValueFrom(api.list(query({ size: 100, filters: { status: 'REQUESTED' } })));
    await expect(
      firstValueFrom(api.reject(page.items[0].id, { reason: '  ' })),
    ).rejects.toMatchObject({ status: 422, fieldErrors: { reason: expect.any(Array) } });
  });

  it('markPaid records the payment reference', async () => {
    const page = await firstValueFrom(
      api.list(query({ size: 100, filters: { status: 'PROCESSING' } })),
    );
    const updated = await firstValueFrom(
      api.markPaid(page.items[0].id, { paymentReference: 'UTR999888777666' }),
    );
    expect(updated.status).toBe('PAID');
    expect(updated.paymentReference).toBe('UTR999888777666');
    expect(updated.allowedActions).toEqual([]);
  });

  it('filters by beneficiary type', async () => {
    const page = await firstValueFrom(
      api.list(query({ size: 100, filters: { beneficiaryType: 'ORGANISATION' } })),
    );
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((w) => w.beneficiaryType === 'ORGANISATION')).toBe(true);
  });
});
