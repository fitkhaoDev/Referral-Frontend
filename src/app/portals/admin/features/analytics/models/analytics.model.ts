import { IsoDate } from '@core/models/api.model';
import { Money } from '@core/models/money.model';

export type AnalyticsGranularity = 'MONTH' | 'QUARTER' | 'YEAR';

export const ANALYTICS_GRANULARITY_LABEL: Record<AnalyticsGranularity, string> = {
  MONTH: 'Monthly',
  QUARTER: 'Quarterly',
  YEAR: 'Yearly',
};

export interface AnalyticsQuery {
  readonly granularity: AnalyticsGranularity;
  /** Inclusive. Omit both for the backend's default trailing window. */
  readonly fromDate?: string;
  readonly toDate?: string;
}

/** ngx-charts single-series datum. */
export interface SeriesPoint {
  readonly name: string;
  readonly value: number;
}

/** ngx-charts multi-series group. */
export interface NamedSeries {
  readonly name: string;
  readonly series: readonly SeriesPoint[];
}

export interface RankRow {
  readonly id: string;
  readonly name: string;
  readonly referrals: number;
  readonly earned: Money;
}

/**
 * Everything the analytics screen renders, pre-aggregated by the backend.
 *
 * The client performs NO aggregation. Count series carry integer counts; money
 * series (`commissionsOverTime`, `withdrawalsOverTime`) carry major-currency-unit
 * numbers the backend already computed for charting. `totals` carry {@link Money}
 * (minor units) for exact display via the money pipe.
 */
export interface AnalyticsOverview {
  readonly range: {
    readonly from: IsoDate;
    readonly to: IsoDate;
    readonly granularity: AnalyticsGranularity;
  };
  readonly totals: {
    readonly referrals: number;
    readonly commissionsEarned: Money;
    readonly commissionsPaid: Money;
    readonly commissionsReversed: Money;
    readonly withdrawalsPaid: Money;
    readonly activePartners: number;
    readonly activeOrganisations: number;
  };
  /** Referral count per bucket. */
  readonly referralsOverTime: readonly SeriesPoint[];
  /** Earned / Paid / Reversed lines, values in ₹ (major units). */
  readonly commissionsOverTime: readonly NamedSeries[];
  /** Withdrawals paid per bucket, values in ₹ (major units). */
  readonly withdrawalsOverTime: readonly SeriesPoint[];
  /** Referral count by referral-event name. */
  readonly eventBreakdown: readonly SeriesPoint[];
  /** Commission count by beneficiary type (Partner / Organisation / Doctor). */
  readonly beneficiarySplit: readonly SeriesPoint[];
  readonly topPartners: readonly RankRow[];
  readonly topOrganisations: readonly RankRow[];
}
