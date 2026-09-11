import { ParamMap, Params } from '@angular/router';
import { PageQuery, SortSpec } from '@core/models/api.model';

/**
 * Serialise a {@link PageQuery} to URL query params. Defaults (page 0, default size,
 * empty search/sort/filters) are omitted so the URL stays clean. Sensitive values
 * must never be passed as filters on financial screens — callers control `filters`.
 */
export function queryToParams(query: PageQuery, defaultSize: number): Params {
  const params: Params = {};
  if (query.page && query.page > 0) params['page'] = String(query.page);
  if (query.size && query.size !== defaultSize) params['size'] = String(query.size);
  if (query.search) params['q'] = query.search;

  const sort = query.sort?.[0];
  if (sort) params['sort'] = `${sort.field},${sort.direction}`;

  for (const [key, value] of Object.entries(query.filters ?? {})) {
    if (value !== null && value !== undefined && value !== '') {
      params[key] = String(value);
    }
  }
  return params;
}

/** Parse URL query params back into a {@link PageQuery}, using `base` for fallbacks. */
export function paramsToQuery(
  map: ParamMap,
  base: PageQuery,
  filterKeys: readonly string[],
): PageQuery {
  const page = Number.parseInt(map.get('page') ?? '', 10);
  const size = Number.parseInt(map.get('size') ?? '', 10);
  const search = map.get('q') ?? '';

  let sort: SortSpec[] = base.sort ? [...base.sort] : [];
  const rawSort = map.get('sort');
  if (rawSort) {
    const [field, dir] = rawSort.split(',');
    if (field) sort = [{ field, direction: dir === 'desc' ? 'desc' : 'asc' }];
  }

  const filters: Record<string, string> = {};
  for (const key of filterKeys) {
    const value = map.get(key);
    if (value !== null && value !== '') filters[key] = value;
  }

  return {
    page: Number.isFinite(page) && page >= 0 ? page : 0,
    size: Number.isFinite(size) && size > 0 ? size : base.size,
    search,
    sort,
    filters,
  };
}
