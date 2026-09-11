import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockAnalyticsApiService } from './mock-analytics-api.service';

describe('MockAnalyticsApiService', () => {
  let api: MockAnalyticsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockAnalyticsApiService] });
    api = TestBed.inject(MockAnalyticsApiService);
  });

  it('returns 12 monthly buckets for every series', async () => {
    const o = await firstValueFrom(api.getOverview({ granularity: 'MONTH' }));
    expect(o.range.granularity).toBe('MONTH');
    expect(o.referralsOverTime).toHaveLength(12);
    expect(o.withdrawalsOverTime).toHaveLength(12);
    for (const s of o.commissionsOverTime) expect(s.series).toHaveLength(12);
    expect(o.commissionsOverTime.map((s) => s.name)).toEqual(['Earned', 'Paid', 'Reversed']);
  });

  it('uses fewer, larger buckets for QUARTER and YEAR', async () => {
    const q = await firstValueFrom(api.getOverview({ granularity: 'QUARTER' }));
    const y = await firstValueFrom(api.getOverview({ granularity: 'YEAR' }));
    expect(q.referralsOverTime).toHaveLength(8);
    expect(y.referralsOverTime).toHaveLength(3);
    expect(y.totals.referrals).toBeGreaterThan(q.totals.referrals);
  });

  it('is deterministic across calls', async () => {
    const a = await firstValueFrom(api.getOverview({ granularity: 'MONTH' }));
    const b = await firstValueFrom(api.getOverview({ granularity: 'MONTH' }));
    expect(b).toEqual(a);
  });

  it('carries Money totals and ranked lists', async () => {
    const o = await firstValueFrom(api.getOverview({ granularity: 'MONTH' }));
    expect(o.totals.commissionsEarned.currency).toBe('INR');
    expect(o.totals.commissionsEarned.minorUnits).toBeGreaterThan(0);
    expect(o.topPartners.length).toBeGreaterThan(0);
    expect(o.topOrganisations[0].earned.minorUnits).toBeGreaterThan(0);
    expect(o.eventBreakdown.reduce((n, s) => n + s.value, 0)).toBeGreaterThan(0);
  });
});
