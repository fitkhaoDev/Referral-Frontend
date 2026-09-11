import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiError, Id, SortSpec } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateDiscountRulePayload,
  DiscountRule,
  DiscountRuleFilters,
  UpdateDiscountRulePayload,
} from '../models/discount-rule.model';
import { DiscountRuleActions } from './discount-rules.actions';
import {
  selectDiscountRulesCrudError,
  selectDiscountRulesSaving,
} from './discount-rules.crud.reducer';
import { discountRulesList } from './discount-rules.list';

/** Component-facing surface for the Discount Rules screen. */
@Injectable()
export class DiscountRulesFacade {
  private readonly store = inject(Store);
  private readonly s = discountRulesList.selectors;

  readonly rows: Signal<DiscountRule[]> = this.store.selectSignal(this.s.selectRows);
  readonly loading = this.store.selectSignal(this.s.selectIsLoading);
  readonly page = this.store.selectSignal(this.s.selectPage);
  readonly sort = this.store.selectSignal(this.s.selectSort);
  readonly search = this.store.selectSignal(this.s.selectSearch);
  readonly filters = this.store.selectSignal(this.s.selectFilters) as Signal<DiscountRuleFilters>;
  readonly activeFilterCount = this.store.selectSignal(this.s.selectActiveFilterCount);
  readonly isEmpty = this.store.selectSignal(this.s.selectIsEmpty);
  readonly listError: Signal<ApiError | null> = this.store.selectSignal(this.s.selectError);

  readonly saving = this.store.selectSignal(selectDiscountRulesSaving);
  readonly crudError: Signal<ApiError | null> = this.store.selectSignal(selectDiscountRulesCrudError);

  setSearch(search: string): void {
    this.store.dispatch(discountRulesList.actions.searchChanged({ search }));
  }
  setSort(sort: SortSpec[]): void {
    this.store.dispatch(discountRulesList.actions.sortChanged({ sort }));
  }
  setPage(page: number, size: number): void {
    this.store.dispatch(discountRulesList.actions.pageChanged({ page, size }));
  }
  setFilters(filters: DiscountRuleFilters): void {
    this.store.dispatch(
      discountRulesList.actions.filtersChanged({
        filters: { ...filters } as Record<string, string | number | boolean | null | undefined>,
      }),
    );
  }
  clearFilters(): void {
    this.store.dispatch(discountRulesList.actions.filtersCleared());
  }
  reload(): void {
    this.store.dispatch(discountRulesList.actions.reload());
  }

  create(payload: CreateDiscountRulePayload): void {
    this.store.dispatch(DiscountRuleActions.create({ payload }));
  }
  update(id: Id, payload: UpdateDiscountRulePayload): void {
    this.store.dispatch(DiscountRuleActions.update({ id, payload }));
  }
  setStatus(id: Id, status: EntityStatus): void {
    this.store.dispatch(DiscountRuleActions.setStatus({ id, status }));
  }
}
