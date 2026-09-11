import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiError, SortSpec } from '@core/models/api.model';
import { Commission, CommissionFilters } from '../models/commission.model';
import { commissionsList } from './commissions.list';

/** Component-facing surface for the Commissions screen (read-only). */
@Injectable()
export class CommissionsFacade {
  private readonly store = inject(Store);
  private readonly s = commissionsList.selectors;

  readonly rows: Signal<Commission[]> = this.store.selectSignal(this.s.selectRows);
  readonly loading = this.store.selectSignal(this.s.selectIsLoading);
  readonly page = this.store.selectSignal(this.s.selectPage);
  readonly sort = this.store.selectSignal(this.s.selectSort);
  readonly search = this.store.selectSignal(this.s.selectSearch);
  readonly filters = this.store.selectSignal(this.s.selectFilters) as Signal<CommissionFilters>;
  readonly activeFilterCount = this.store.selectSignal(this.s.selectActiveFilterCount);
  readonly isEmpty = this.store.selectSignal(this.s.selectIsEmpty);
  readonly listError: Signal<ApiError | null> = this.store.selectSignal(this.s.selectError);

  setSearch(search: string): void {
    this.store.dispatch(commissionsList.actions.searchChanged({ search }));
  }
  setSort(sort: SortSpec[]): void {
    this.store.dispatch(commissionsList.actions.sortChanged({ sort }));
  }
  setPage(page: number, size: number): void {
    this.store.dispatch(commissionsList.actions.pageChanged({ page, size }));
  }
  setFilters(filters: CommissionFilters): void {
    this.store.dispatch(
      commissionsList.actions.filtersChanged({
        filters: { ...filters } as Record<string, string | number | boolean | null | undefined>,
      }),
    );
  }
  clearFilters(): void {
    this.store.dispatch(commissionsList.actions.filtersCleared());
  }
  reload(): void {
    this.store.dispatch(commissionsList.actions.reload());
  }
}
