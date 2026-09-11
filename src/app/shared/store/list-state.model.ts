import { EntityState } from '@ngrx/entity';
import { ApiError, PageQuery } from '@core/models/api.model';

export type ListStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Generic state shape for a server-paginated list feature. The current page of
 * entities is held in the `@ngrx/entity` collection (insertion order = server
 * order); `query` is the single source of truth for pagination / sort / search /
 * filters and is mirrored to the URL.
 */
export interface ListState<T> extends EntityState<T> {
  readonly query: PageQuery;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly status: ListStatus;
  readonly error: ApiError | null;
}

/** Drop `null` / `undefined` / `''` filter entries so they never hit the query string. */
export function pruneFilters(
  filters: Record<string, string | number | boolean | null | undefined>,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== ''),
  ) as Record<string, string | number | boolean>;
}
