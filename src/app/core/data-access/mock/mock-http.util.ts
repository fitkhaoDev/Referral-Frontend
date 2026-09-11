import { Observable, of, throwError, timer } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { ApiError, Page, PageQuery, SortSpec } from '@core/models/api.model';
import { apiError } from '@core/models/api-error.util';

/**
 * Helpers for the development-only mock data layer.
 *
 * Every mock implementation returns hand-authored fixtures with realistic latency,
 * pagination and error behaviour. These files never ship (`environment.useMockApi`
 * is `false` in production). No fixture here performs financial arithmetic — money
 * figures are authored as fixed, representative values.
 */

function randomLatency(): number {
  const [min, max] = environment.mockLatencyMs;
  if (max <= 0) return 0;
  return Math.round(min + Math.random() * (max - min));
}

/** Emit a successful mock response after simulated network latency. */
export function mockOk<T>(value: T): Observable<T> {
  return of(value).pipe(delay(randomLatency()));
}

/** Emit a normalised {@link ApiError} after simulated latency. */
export function mockFail(
  error: Partial<ApiError> & Pick<ApiError, 'status' | 'code' | 'message'>,
): Observable<never> {
  return timer(randomLatency()).pipe(mergeMap(() => throwError(() => apiError(error))));
}

/** Apply free-text search, filtering, sorting and pagination to an in-memory array. */
export function paginate<T>(
  source: readonly T[],
  query: PageQuery,
  opts: {
    searchable?: (item: T) => string;
    filter?: (item: T, filters: NonNullable<PageQuery['filters']>) => boolean;
    comparator?: (sort: SortSpec) => (a: T, b: T) => number;
  } = {},
): Page<T> {
  let rows = [...source];

  const term = query.search?.trim().toLowerCase();
  if (term && opts.searchable) {
    rows = rows.filter((r) => opts.searchable!(r).toLowerCase().includes(term));
  }

  if (query.filters && opts.filter) {
    const active = Object.fromEntries(
      Object.entries(query.filters).filter(
        ([, v]) => v !== null && v !== undefined && v !== '',
      ),
    ) as NonNullable<PageQuery['filters']>;
    if (Object.keys(active).length) {
      rows = rows.filter((r) => opts.filter!(r, active));
    }
  }

  if (query.sort?.length && opts.comparator) {
    for (const sort of [...query.sort].reverse()) {
      const cmp = opts.comparator(sort);
      rows.sort((a, b) => (sort.direction === 'desc' ? -cmp(a, b) : cmp(a, b)));
    }
  }

  const totalItems = rows.length;
  const size = Math.max(1, query.size);
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const page = Math.min(Math.max(0, query.page), totalPages - 1);
  const start = page * size;

  return { items: rows.slice(start, start + size), page, size, totalItems, totalPages };
}

/** Deterministic pseudo-id for fixtures. */
export function fixtureId(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(6, '0')}`;
}
