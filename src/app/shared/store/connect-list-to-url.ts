import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ListFeature } from './create-list-feature';
import { paramsToQuery, queryToParams } from './list-url.util';

export interface ConnectListToUrlOptions {
  /** Filter keys to read from / write to the URL for this list. */
  readonly filterKeys?: readonly string[];
  /**
   * Omit the `size` param from the URL (default size always applies on load).
   * Defaults to `true` — on reload, every list starts at its initial page size.
   * Set to `false` only if a caller explicitly wants URL-persisted size.
   */
  readonly omitSize?: boolean;
  /**
   * Omit the `sort` param from the URL (default sort always applies on load).
   * Defaults to `true`. Set to `false` for shareable-sort-order views.
   */
  readonly omitSort?: boolean;
}

/**
 * Two-way binds a list feature's query to the page URL. Call once from a list
 * component's constructor (injection context required).
 *
 * - On init: reads query params, dispatches `querySetFromUrl` (which triggers the
 *   first load), so a refreshed/shared URL restores the exact view.
 * - Thereafter: every query change is written back with `replaceUrl` (search-as-you
 *   -type shouldn't spam history).
 */
export function connectListToUrl<T>(
  feature: ListFeature<T>,
  options: ConnectListToUrlOptions = {},
): void {
  const store = inject(Store);
  const route = inject(ActivatedRoute);
  const router = inject(Router);
  const destroyRef = inject(DestroyRef);
  const filterKeys = options.filterKeys ?? [];
  const defaultSize = feature.initialState.query.size;
  const { omitSize = true, omitSort = true } = options;

  const initialQuery = paramsToQuery(
    route.snapshot.queryParamMap,
    feature.initialState.query,
    filterKeys,
    { ignoreSize: omitSize, ignoreSort: omitSort },
  );
  store.dispatch(feature.actions.querySetFromUrl({ query: initialQuery }));

  const serialize = (query: typeof initialQuery) => {
    const params = queryToParams(query, defaultSize);
    if (omitSize) delete params['size'];
    if (omitSort) delete params['sort'];
    return params;
  };

  let lastSerialized = JSON.stringify(serialize(initialQuery));

  store
    .select(feature.selectors.selectQuery)
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe((query) => {
      const params = serialize(query);
      const serialized = JSON.stringify(params);
      if (serialized === lastSerialized) return;
      lastSerialized = serialized;
      void router.navigate([], {
        relativeTo: route,
        queryParams: params,
        replaceUrl: true,
      });
    });
}
