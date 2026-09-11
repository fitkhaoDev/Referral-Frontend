import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiError, Id, SortSpec } from '@core/models/api.model';
import { Withdrawal, WithdrawalFilters, WithdrawalPolicy } from '../models/withdrawal.model';
import { WithdrawalActions } from './withdrawals.actions';
import {
  selectWithdrawalActing,
  selectWithdrawalActionError,
  selectWithdrawalDetail,
  selectWithdrawalDetailLoadError,
  selectWithdrawalDetailLoading,
  selectWithdrawalPolicy,
} from './withdrawals.detail.reducer';
import { withdrawalsList } from './withdrawals.list';

/** Component-facing surface for the Withdrawals screens (list + detail + actions). */
@Injectable()
export class WithdrawalsFacade {
  private readonly store = inject(Store);
  private readonly s = withdrawalsList.selectors;

  readonly rows: Signal<Withdrawal[]> = this.store.selectSignal(this.s.selectRows);
  readonly loading = this.store.selectSignal(this.s.selectIsLoading);
  readonly page = this.store.selectSignal(this.s.selectPage);
  readonly sort = this.store.selectSignal(this.s.selectSort);
  readonly search = this.store.selectSignal(this.s.selectSearch);
  readonly filters = this.store.selectSignal(this.s.selectFilters) as Signal<WithdrawalFilters>;
  readonly activeFilterCount = this.store.selectSignal(this.s.selectActiveFilterCount);
  readonly isEmpty = this.store.selectSignal(this.s.selectIsEmpty);
  readonly listError: Signal<ApiError | null> = this.store.selectSignal(this.s.selectError);

  readonly detail: Signal<Withdrawal | null> = this.store.selectSignal(selectWithdrawalDetail);
  readonly detailLoading = this.store.selectSignal(selectWithdrawalDetailLoading);
  readonly detailLoadError: Signal<ApiError | null> = this.store.selectSignal(
    selectWithdrawalDetailLoadError,
  );
  readonly policy: Signal<WithdrawalPolicy | null> = this.store.selectSignal(selectWithdrawalPolicy);
  readonly acting = this.store.selectSignal(selectWithdrawalActing);
  readonly actionError: Signal<ApiError | null> = this.store.selectSignal(selectWithdrawalActionError);

  setSearch(search: string): void {
    this.store.dispatch(withdrawalsList.actions.searchChanged({ search }));
  }
  setSort(sort: SortSpec[]): void {
    this.store.dispatch(withdrawalsList.actions.sortChanged({ sort }));
  }
  setPage(page: number, size: number): void {
    this.store.dispatch(withdrawalsList.actions.pageChanged({ page, size }));
  }
  setFilters(filters: WithdrawalFilters): void {
    this.store.dispatch(
      withdrawalsList.actions.filtersChanged({
        filters: { ...filters } as Record<string, string | number | boolean | null | undefined>,
      }),
    );
  }
  clearFilters(): void {
    this.store.dispatch(withdrawalsList.actions.filtersCleared());
  }
  reload(): void {
    this.store.dispatch(withdrawalsList.actions.reload());
  }

  loadPolicy(): void {
    this.store.dispatch(WithdrawalActions.loadPolicy());
  }
  loadDetail(id: Id): void {
    this.store.dispatch(WithdrawalActions.loadDetail({ id }));
  }
  clearDetail(): void {
    this.store.dispatch(WithdrawalActions.detailCleared());
  }
  clearActionError(): void {
    this.store.dispatch(WithdrawalActions.actionErrorCleared());
  }

  approve(id: Id): void {
    this.store.dispatch(WithdrawalActions.approve({ id }));
  }
  reject(id: Id, reason: string): void {
    this.store.dispatch(WithdrawalActions.reject({ id, reason }));
  }
  markProcessing(id: Id): void {
    this.store.dispatch(WithdrawalActions.markProcessing({ id }));
  }
  markPaid(id: Id, paymentReference: string): void {
    this.store.dispatch(WithdrawalActions.markPaid({ id, paymentReference }));
  }
  markFailed(id: Id, reason: string): void {
    this.store.dispatch(WithdrawalActions.markFailed({ id, reason }));
  }
}
