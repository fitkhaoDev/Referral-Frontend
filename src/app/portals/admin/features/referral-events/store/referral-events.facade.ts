import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiError, Id, SortSpec } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateReferralEventPayload,
  ReferralEvent,
  ReferralEventFilters,
  UpdateReferralEventPayload,
} from '../models/referral-event.model';
import { ReferralEventActions } from './referral-events.actions';
import {
  selectReferralEventsCrudError,
  selectReferralEventsSaving,
} from './referral-events.crud.reducer';
import { referralEventsList } from './referral-events.list';

/** Component-facing surface for the Referral Events screen. */
@Injectable()
export class ReferralEventsFacade {
  private readonly store = inject(Store);
  private readonly s = referralEventsList.selectors;

  readonly rows: Signal<ReferralEvent[]> = this.store.selectSignal(this.s.selectRows);
  readonly loading = this.store.selectSignal(this.s.selectIsLoading);
  readonly page = this.store.selectSignal(this.s.selectPage);
  readonly sort = this.store.selectSignal(this.s.selectSort);
  readonly search = this.store.selectSignal(this.s.selectSearch);
  readonly filters = this.store.selectSignal(this.s.selectFilters) as Signal<ReferralEventFilters>;
  readonly activeFilterCount = this.store.selectSignal(this.s.selectActiveFilterCount);
  readonly isEmpty = this.store.selectSignal(this.s.selectIsEmpty);
  readonly listError: Signal<ApiError | null> = this.store.selectSignal(this.s.selectError);

  readonly saving = this.store.selectSignal(selectReferralEventsSaving);
  readonly crudError: Signal<ApiError | null> = this.store.selectSignal(selectReferralEventsCrudError);

  setSearch(search: string): void {
    this.store.dispatch(referralEventsList.actions.searchChanged({ search }));
  }

  setSort(sort: SortSpec[]): void {
    this.store.dispatch(referralEventsList.actions.sortChanged({ sort }));
  }

  setPage(page: number, size: number): void {
    this.store.dispatch(referralEventsList.actions.pageChanged({ page, size }));
  }

  setFilters(filters: ReferralEventFilters): void {
    this.store.dispatch(
      referralEventsList.actions.filtersChanged({
        filters: { ...filters } as Record<string, string | number | boolean | null | undefined>,
      }),
    );
  }

  clearFilters(): void {
    this.store.dispatch(referralEventsList.actions.filtersCleared());
  }

  reload(): void {
    this.store.dispatch(referralEventsList.actions.reload());
  }

  create(payload: CreateReferralEventPayload): void {
    this.store.dispatch(ReferralEventActions.create({ payload }));
  }

  update(id: Id, payload: UpdateReferralEventPayload): void {
    this.store.dispatch(ReferralEventActions.update({ id, payload }));
  }

  setStatus(id: Id, status: EntityStatus): void {
    this.store.dispatch(ReferralEventActions.setStatus({ id, status }));
  }
}
