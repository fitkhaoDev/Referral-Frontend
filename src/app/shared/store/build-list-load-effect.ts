import { Actions, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Action, Store } from '@ngrx/store';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { isApiError } from '@core/models/api-error.util';
import { ApiError, Page, PageQuery } from '@core/models/api.model';
import { ListFeature } from './create-list-feature';

function toApiError(err: unknown): ApiError {
  return isApiError(err)
    ? err
    : { status: 0, code: 'UNKNOWN', message: 'Could not load the list. Please try again.' };
}

/**
 * Wires the standard "any query-affecting action → refetch the current page" effect
 * for a list feature.
 *
 * `switchMap` means an in-flight request is abandoned when the query changes again
 * (the spec's rule for filter/sort/page changes). Search is debounced upstream in
 * the filter bar before `searchChanged` is dispatched.
 *
 * ```ts
 * @Injectable()
 * export class PartnerTypesEffects {
 *   private readonly actions$ = inject(Actions);
 *   private readonly store = inject(Store);
 *   private readonly api = inject(PartnerTypeApi);
 *   readonly load$ = createEffect(() =>
 *     buildListLoadEffect(this.actions$, this.store, partnerTypesList, (q) => this.api.list(q)),
 *   );
 * }
 * ```
 */
export function buildListLoadEffect<T>(
  actions$: Actions,
  store: Store,
  feature: ListFeature<T>,
  fetch: (query: PageQuery) => Observable<Page<T>>,
): Observable<Action> {
  const a = feature.actions;
  return actions$.pipe(
    ofType(
      a.opened,
      a.querySetFromUrl,
      a.searchChanged,
      a.sortChanged,
      a.pageChanged,
      a.filtersChanged,
      a.filtersCleared,
      a.reload,
    ),
    concatLatestFrom(() => store.select(feature.selectors.selectQuery)),
    switchMap(([, query]) =>
      fetch(query).pipe(
        map((result) => a.loadPageSuccess({ result })),
        catchError((error: unknown) => of(a.loadPageFailure({ error: toApiError(error) }))),
      ),
    ),
  );
}
