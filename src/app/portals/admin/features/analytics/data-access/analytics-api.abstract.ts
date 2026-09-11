import { Observable } from 'rxjs';
import { AnalyticsOverview, AnalyticsQuery } from '../models/analytics.model';

/**
 * Analytics contract (admin, permission `analytics:read`). Read-only.
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * getOverview  GET  /api/admin/analytics/overview
 *   query   granularity = MONTH | QUARTER | YEAR   (required),
 *           fromDate=YYYY-MM-DD, toDate=YYYY-MM-DD  (optional; default = backend's
 *           trailing window, e.g. last 12 months / 8 quarters / 3 years)
 *   res     200 AnalyticsOverview
 *
 * PROVISIONAL — the exact metric set, bucketing and default windows are open
 * (see OQ-9 in the backend brief). Firm contract:
 *   • Every series is pre-aggregated server-side. The client renders points as-is
 *     and performs no grouping, summing or bucketing.
 *   • Count series → integer counts. Money-valued series → major-currency-unit
 *     numbers for charting. `totals.*` money fields → Money (minor units).
 *   • Bucket `name`s are display-ready, ordered oldest → newest.
 */
export abstract class AnalyticsApi {
  abstract getOverview(query: AnalyticsQuery): Observable<AnalyticsOverview>;
}
