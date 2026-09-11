import { Page } from '@core/models/api.model';
import { createListFeature } from './create-list-feature';

interface Row {
  id: string;
  name: string;
}

function makeFeature() {
  return createListFeature<Row>({ name: 'testRows', selectId: (r) => r.id, initialPageSize: 20 });
}

function page(items: Row[], overrides: Partial<Page<Row>> = {}): Page<Row> {
  return { items, page: 0, size: 20, totalItems: items.length, totalPages: 1, ...overrides };
}

describe('createListFeature reducer', () => {
  it('starts idle with the initial query', () => {
    const { reducer, initialState } = makeFeature();
    const state = reducer(undefined, { type: '@@init' } as never);
    expect(state.status).toBe('idle');
    expect(state.query).toEqual(initialState.query);
  });

  it('search change resets to page 0 and marks loading', () => {
    const f = makeFeature();
    let state = f.reducer(f.initialState, f.actions.pageChanged({ page: 3, size: 20 }));
    state = f.reducer(state, f.actions.searchChanged({ search: 'apollo' }));
    expect(state.query.page).toBe(0);
    expect(state.query.search).toBe('apollo');
    expect(state.status).toBe('loading');
  });

  it('filters change prunes empty values and resets page', () => {
    const f = makeFeature();
    let state = f.reducer(f.initialState, f.actions.pageChanged({ page: 2, size: 20 }));
    state = f.reducer(state, f.actions.filtersChanged({ filters: { status: 'ACTIVE', category: '' } }));
    expect(state.query.filters).toEqual({ status: 'ACTIVE' });
    expect(state.query.page).toBe(0);
  });

  it('loadPageSuccess replaces the collection and stores totals', () => {
    const f = makeFeature();
    const state = f.reducer(
      f.initialState,
      f.actions.loadPageSuccess({
        result: page([{ id: '1', name: 'A' }, { id: '2', name: 'B' }], { totalItems: 42, totalPages: 3, page: 1 }),
      }),
    );
    expect(f.selectors.selectRows.projector(state)).toHaveLength(2);
    expect(state.totalItems).toBe(42);
    expect(state.query.page).toBe(1);
    expect(state.status).toBe('loaded');
  });

  it('filtersCleared wipes search + filters', () => {
    const f = makeFeature();
    let state = f.reducer(f.initialState, f.actions.searchChanged({ search: 'x' }));
    state = f.reducer(state, f.actions.filtersChanged({ filters: { status: 'ACTIVE' } }));
    state = f.reducer(state, f.actions.filtersCleared());
    expect(state.query.search).toBe('');
    expect(state.query.filters).toEqual({});
  });

  it('selectActiveFilterCount counts search + non-empty filters', () => {
    const f = makeFeature();
    let state = f.reducer(f.initialState, f.actions.searchChanged({ search: 'x' }));
    state = f.reducer(
      state,
      f.actions.filtersChanged({ filters: { status: 'ACTIVE', category: 'INDIVIDUAL' } }),
    );
    expect(f.selectors.selectActiveFilterCount.projector(state)).toBe(3);
  });
});
