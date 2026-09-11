import { EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import {
  createAction,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
  props,
} from '@ngrx/store';
import {
  ApiError,
  DEFAULT_PAGE_SIZE,
  Id,
  Page,
  PageQuery,
  SortSpec,
} from '@core/models/api.model';
import { ListState, pruneFilters } from './list-state.model';

export interface CreateListFeatureConfig<T> {
  /** NgRx feature key, e.g. `'partnerTypes'`. */
  readonly name: string;
  readonly selectId: (entity: T) => Id;
  readonly initialPageSize?: number;
  readonly initialSort?: SortSpec[];
}

type FilterMap = Record<string, string | number | boolean | null | undefined>;

/**
 * Builds the actions, reducer and selectors for a server-paginated list feature.
 *
 * The feature owns ONLY list/query state. Each consuming feature module registers
 * `reducer` under `name` via `StoreModule.forFeature`, and wires a load effect with
 * {@link buildListLoadEffect}. Entity mutations (create/update/status) are added as
 * feature-specific actions/effects that dispatch `reload` on success.
 */
export function createListFeature<T>(config: CreateListFeatureConfig<T>) {
  const adapter: EntityAdapter<T> = createEntityAdapter<T>({ selectId: config.selectId });

  const initialQuery: PageQuery = {
    page: 0,
    size: config.initialPageSize ?? DEFAULT_PAGE_SIZE,
    sort: config.initialSort ?? [],
    search: '',
    filters: {},
  };

  const initialState: ListState<T> = adapter.getInitialState({
    query: initialQuery,
    totalItems: 0,
    totalPages: 0,
    status: 'idle',
    error: null,
  });

  // `createActionGroup` requires a string-literal source; this factory takes a
  // runtime name, so actions are built with `createAction` and a namespaced type.
  const t = (event: string): string => `[${config.name}] ${event}`;
  const actions = {
    opened: createAction(t('Opened')),
    querySetFromUrl: createAction(t('Query Set From Url'), props<{ query: PageQuery }>()),
    searchChanged: createAction(t('Search Changed'), props<{ search: string }>()),
    sortChanged: createAction(t('Sort Changed'), props<{ sort: SortSpec[] }>()),
    pageChanged: createAction(t('Page Changed'), props<{ page: number; size: number }>()),
    filtersChanged: createAction(t('Filters Changed'), props<{ filters: FilterMap }>()),
    filtersCleared: createAction(t('Filters Cleared')),
    reload: createAction(t('Reload')),
    loadPageSuccess: createAction(t('Load Page Success'), props<{ result: Page<T> }>()),
    loadPageFailure: createAction(t('Load Page Failure'), props<{ error: ApiError }>()),
  } as const;

  const selectState = createFeatureSelector<ListState<T>>(config.name);
  const entitySelectors = adapter.getSelectors(selectState);

  const selectors = {
    selectState,
    selectRows: entitySelectors.selectAll,
    selectCount: entitySelectors.selectTotal,
    selectQuery: createSelector(selectState, (s) => s.query),
    selectSearch: createSelector(selectState, (s) => s.query.search ?? ''),
    selectSort: createSelector(selectState, (s) => s.query.sort ?? []),
    selectFilters: createSelector(selectState, (s) => (s.query.filters ?? {}) as FilterMap),
    selectStatus: createSelector(selectState, (s) => s.status),
    selectIsLoading: createSelector(selectState, (s) => s.status === 'loading'),
    selectError: createSelector(selectState, (s) => s.error),
    selectPage: createSelector(selectState, (s) => ({
      page: s.query.page,
      size: s.query.size,
      totalItems: s.totalItems,
      totalPages: s.totalPages,
    })),
    selectIsEmpty: createSelector(
      selectState,
      entitySelectors.selectTotal,
      (s, total) => s.status === 'loaded' && total === 0,
    ),
    selectActiveFilterCount: createSelector(selectState, (s) => {
      const filters = (s.query.filters ?? {}) as FilterMap;
      const active = Object.values(filters).filter(
        (v) => v !== null && v !== undefined && v !== '',
      ).length;
      return active + (s.query.search ? 1 : 0);
    }),
  };

  const reducer = createReducer<ListState<T>>(
    initialState,
    on(actions.opened, actions.reload, (s) => ({ ...s, status: 'loading' })),
    on(actions.querySetFromUrl, (s, { query }) => ({ ...s, query, status: 'loading' })),
    on(actions.searchChanged, (s, { search }) => ({
      ...s,
      query: { ...s.query, search, page: 0 },
      status: 'loading',
    })),
    on(actions.sortChanged, (s, { sort }) => ({
      ...s,
      query: { ...s.query, sort, page: 0 },
      status: 'loading',
    })),
    on(actions.pageChanged, (s, { page, size }) => ({
      ...s,
      query: { ...s.query, page, size },
      status: 'loading',
    })),
    on(actions.filtersChanged, (s, { filters }) => ({
      ...s,
      query: {
        ...s.query,
        filters: pruneFilters({ ...(s.query.filters ?? {}), ...filters }),
        page: 0,
      },
      status: 'loading',
    })),
    on(actions.filtersCleared, (s) => ({
      ...s,
      query: { ...s.query, filters: {}, search: '', page: 0 },
      status: 'loading',
    })),
    on(actions.loadPageSuccess, (s, { result }) =>
      adapter.setAll(result.items as T[], {
        ...s,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        query: { ...s.query, page: result.page, size: result.size },
        status: 'loaded',
        error: null,
      }),
    ),
    on(actions.loadPageFailure, (s, { error }) => ({ ...s, status: 'error', error })),
  );

  return { name: config.name, adapter, actions, reducer, selectors, initialState };
}

export type ListFeature<T> = ReturnType<typeof createListFeature<T>>;
