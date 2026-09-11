import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiError, Id, SortSpec } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateIncentiveRulePayload,
  IncentiveRule,
  IncentiveRuleFilters,
  UpdateIncentiveRulePayload,
} from '../models/incentive-rule.model';
import { IncentiveRuleActions } from './incentive-rules.actions';
import {
  selectIncentiveRulesCrudError,
  selectIncentiveRulesSaving,
} from './incentive-rules.crud.reducer';
import { incentiveRulesList } from './incentive-rules.list';

/** Component-facing surface for the Incentive Rules screen. */
@Injectable()
export class IncentiveRulesFacade {
  private readonly store = inject(Store);
  private readonly s = incentiveRulesList.selectors;

  readonly rows: Signal<IncentiveRule[]> = this.store.selectSignal(this.s.selectRows);
  readonly loading = this.store.selectSignal(this.s.selectIsLoading);
  readonly page = this.store.selectSignal(this.s.selectPage);
  readonly sort = this.store.selectSignal(this.s.selectSort);
  readonly search = this.store.selectSignal(this.s.selectSearch);
  readonly filters = this.store.selectSignal(this.s.selectFilters) as Signal<IncentiveRuleFilters>;
  readonly activeFilterCount = this.store.selectSignal(this.s.selectActiveFilterCount);
  readonly isEmpty = this.store.selectSignal(this.s.selectIsEmpty);
  readonly listError: Signal<ApiError | null> = this.store.selectSignal(this.s.selectError);

  readonly saving = this.store.selectSignal(selectIncentiveRulesSaving);
  readonly crudError: Signal<ApiError | null> = this.store.selectSignal(
    selectIncentiveRulesCrudError,
  );

  setSearch(search: string): void {
    this.store.dispatch(incentiveRulesList.actions.searchChanged({ search }));
  }
  setSort(sort: SortSpec[]): void {
    this.store.dispatch(incentiveRulesList.actions.sortChanged({ sort }));
  }
  setPage(page: number, size: number): void {
    this.store.dispatch(incentiveRulesList.actions.pageChanged({ page, size }));
  }
  setFilters(filters: IncentiveRuleFilters): void {
    this.store.dispatch(
      incentiveRulesList.actions.filtersChanged({
        filters: { ...filters } as Record<string, string | number | boolean | null | undefined>,
      }),
    );
  }
  clearFilters(): void {
    this.store.dispatch(incentiveRulesList.actions.filtersCleared());
  }
  reload(): void {
    this.store.dispatch(incentiveRulesList.actions.reload());
  }

  create(payload: CreateIncentiveRulePayload): void {
    this.store.dispatch(IncentiveRuleActions.create({ payload }));
  }
  update(id: Id, payload: UpdateIncentiveRulePayload): void {
    this.store.dispatch(IncentiveRuleActions.update({ id, payload }));
  }
  setStatus(id: Id, status: EntityStatus): void {
    this.store.dispatch(IncentiveRuleActions.setStatus({ id, status }));
  }
}
