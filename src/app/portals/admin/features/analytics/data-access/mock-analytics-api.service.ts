import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mockOk } from '@core/data-access/mock/mock-http.util';
import { money } from '@core/models/money.model';
import {
  AnalyticsGranularity,
  AnalyticsOverview,
  AnalyticsQuery,
  NamedSeries,
  RankRow,
  SeriesPoint,
} from '../models/analytics.model';
import { AnalyticsApi } from './analytics-api.abstract';

/** Deterministic PRNG so the fixture is stable across reloads. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOW = new Date();
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Bucket {
  readonly label: string;
  readonly fromIso: string;
  readonly toIso: string;
}

function buckets(granularity: AnalyticsGranularity): Bucket[] {
  const out: Bucket[] = [];
  if (granularity === 'YEAR') {
    const y = NOW.getFullYear();
    for (let i = 2; i >= 0; i--) {
      out.push({ label: `${y - i}`, fromIso: `${y - i}-01-01`, toIso: `${y - i}-12-31` });
    }
  } else if (granularity === 'QUARTER') {
    let y = NOW.getFullYear();
    let q = Math.floor(NOW.getMonth() / 3);
    const seq: Array<[number, number]> = [];
    for (let i = 0; i < 8; i++) {
      seq.unshift([y, q]);
      q -= 1;
      if (q < 0) {
        q = 3;
        y -= 1;
      }
    }
    for (const [yy, qq] of seq) {
      const m0 = qq * 3;
      out.push({
        label: `Q${qq + 1} ${String(yy).slice(2)}`,
        fromIso: `${yy}-${String(m0 + 1).padStart(2, '0')}-01`,
        toIso: `${yy}-${String(m0 + 3).padStart(2, '0')}-28`,
      });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(NOW.getFullYear(), NOW.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      out.push({
        label: `${MONTHS[m]} ${String(y).slice(2)}`,
        fromIso: `${y}-${String(m + 1).padStart(2, '0')}-01`,
        toIso: `${y}-${String(m + 1).padStart(2, '0')}-28`,
      });
    }
  }
  return out;
}

/** Scale factor so YEAR buckets show bigger numbers than MONTH buckets. */
const SCALE: Record<AnalyticsGranularity, number> = { MONTH: 1, QUARTER: 3, YEAR: 12 };

function buildOverview(granularity: AnalyticsGranularity): AnalyticsOverview {
  const bs = buckets(granularity);
  const rand = mulberry32(granularity.length * 7919 + bs.length * 104729);
  const scale = SCALE[granularity];

  const referralsOverTime: SeriesPoint[] = [];
  const earnedSeries: SeriesPoint[] = [];
  const paidSeries: SeriesPoint[] = [];
  const reversedSeries: SeriesPoint[] = [];
  const withdrawalsOverTime: SeriesPoint[] = [];

  let refTotal = 0;
  let earnedTotal = 0;
  let paidTotal = 0;
  let reversedTotal = 0;
  let withdrawnTotal = 0;

  bs.forEach((b, i) => {
    const trend = 1 + i / (bs.length * 2); // gentle upward trend
    const referrals = Math.round((40 + rand() * 90) * scale * trend);
    const earned = Math.round((referrals * (700 + rand() * 500)) / 100) * 100;
    const paid = Math.round(earned * (0.62 + rand() * 0.22));
    const reversed = Math.round(earned * (0.02 + rand() * 0.07));
    const withdrawn = Math.round(paid * (0.7 + rand() * 0.22));

    referralsOverTime.push({ name: b.label, value: referrals });
    earnedSeries.push({ name: b.label, value: earned });
    paidSeries.push({ name: b.label, value: paid });
    reversedSeries.push({ name: b.label, value: reversed });
    withdrawalsOverTime.push({ name: b.label, value: withdrawn });

    refTotal += referrals;
    earnedTotal += earned;
    paidTotal += paid;
    reversedTotal += reversed;
    withdrawnTotal += withdrawn;
  });

  const commissionsOverTime: NamedSeries[] = [
    { name: 'Earned', series: earnedSeries },
    { name: 'Paid', series: paidSeries },
    { name: 'Reversed', series: reversedSeries },
  ];

  const eventBreakdown: SeriesPoint[] = [
    { name: 'Referral Created', value: Math.round(refTotal * 0.34) },
    { name: 'Counselling Completed', value: Math.round(refTotal * 0.28) },
    { name: 'Subscription Purchased', value: Math.round(refTotal * 0.24) },
    { name: 'Subscription Renewed', value: Math.round(refTotal * 0.14) },
  ];

  const beneficiarySplit: SeriesPoint[] = [
    { name: 'Individual partner', value: Math.round(refTotal * 0.52) },
    { name: 'Organisation', value: Math.round(refTotal * 0.31) },
    { name: 'Referring doctor', value: Math.round(refTotal * 0.17) },
  ];

  const topPartners: RankRow[] = [
    { id: 'partner-000001', name: 'Dr. John Doe', referrals: Math.round(58 * scale), earned: money(Math.round(48200 * scale)) },
    { id: 'partner-000002', name: 'Dr. Anaya Mehta', referrals: Math.round(41 * scale), earned: money(Math.round(33900 * scale)) },
    { id: 'partner-000003', name: 'Ritu Sharma', referrals: Math.round(33 * scale), earned: money(Math.round(21500 * scale)) },
    { id: 'partner-000004', name: 'Dr. Sana Iqbal', referrals: Math.round(22 * scale), earned: money(Math.round(14100 * scale)) },
  ];

  const topOrganisations: RankRow[] = [
    { id: 'org-000001', name: 'Apollo Hospital — Dum Dum', referrals: Math.round(96 * scale), earned: money(Math.round(86400 * scale)) },
    { id: 'org-000002', name: 'Fortis Clinic — Bandra', referrals: Math.round(72 * scale), earned: money(Math.round(61200 * scale)) },
    { id: 'org-000003', name: 'HealthFirst Diagnostics — Koramangala', referrals: Math.round(48 * scale), earned: money(Math.round(33500 * scale)) },
    { id: 'org-000004', name: 'PulseFit Gym — Gurugram', referrals: Math.round(29 * scale), earned: money(Math.round(18900 * scale)) },
  ];

  return {
    range: { from: bs[0].fromIso, to: bs[bs.length - 1].toIso, granularity },
    totals: {
      referrals: refTotal,
      commissionsEarned: money(earnedTotal),
      commissionsPaid: money(paidTotal),
      commissionsReversed: money(reversedTotal),
      withdrawalsPaid: money(withdrawnTotal),
      activePartners: 21,
      activeOrganisations: 4,
    },
    referralsOverTime,
    commissionsOverTime,
    withdrawalsOverTime,
    eventBreakdown,
    beneficiarySplit,
    topPartners,
    topOrganisations,
  };
}

/** Development-only in-memory {@link AnalyticsApi}. Fixtures only — no real analytics. */
@Injectable()
export class MockAnalyticsApiService extends AnalyticsApi {
  private readonly cache = new Map<AnalyticsGranularity, AnalyticsOverview>();

  override getOverview(query: AnalyticsQuery): Observable<AnalyticsOverview> {
    let overview = this.cache.get(query.granularity);
    if (!overview) {
      overview = buildOverview(query.granularity);
      this.cache.set(query.granularity, overview);
    }
    return mockOk(overview);
  }
}
