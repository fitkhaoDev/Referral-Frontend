import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiError, SortSpec } from '@core/models/api.model';
import { Referral, ReferralFilters } from '../models/referral.model';
import { referralsList } from './referrals.list';

/** Component-facing surface for the Referrals screen (read-only). */
@Injectable()
export class ReferralsFacade {
  private readonly store = inject(Store);
  private readonly s = referralsList.selectors;

  readonly rows: Signal<Referral[]> = this.store.selectSignal(this.s.selectRows);
  readonly loading = this.store.selectSignal(this.s.selectIsLoading);
  readonly page = this.store.selectSignal(this.s.selectPage);
  readonly sort = this.store.selectSignal(this.s.selectSort);
  readonly search = this.store.selectSignal(this.s.selectSearch);
  readonly filters = this.store.selectSignal(this.s.selectFilters) as Signal<ReferralFilters>;
  readonly activeFilterCount = this.store.selectSignal(this.s.selectActiveFilterCount);
  readonly isEmpty = this.store.selectSignal(this.s.selectIsEmpty);
  readonly listError: Signal<ApiError | null> = this.store.selectSignal(this.s.selectError);

  setSearch(search: string): void {
    this.store.dispatch(referralsList.actions.searchChanged({ search }));
  }
  setSort(sort: SortSpec[]): void {
    this.store.dispatch(referralsList.actions.sortChanged({ sort }));
  }
  setPage(page: number, size: number): void {
    this.store.dispatch(referralsList.actions.pageChanged({ page, size }));
  }
  setFilters(filters: ReferralFilters): void {
    this.store.dispatch(
      referralsList.actions.filtersChanged({
        filters: { ...filters } as Record<string, string | number | boolean | null | undefined>,
      }),
    );
  }
  clearFilters(): void {
    this.store.dispatch(referralsList.actions.filtersCleared());
  }
  reload(): void {
    this.store.dispatch(referralsList.actions.reload());
  }
}
