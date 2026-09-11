import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiError, Id, SortSpec } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreatePartnerTypePayload,
  PartnerType,
  PartnerTypeFilters,
  UpdatePartnerTypePayload,
} from '../models/partner-type.model';
import { PartnerTypeActions } from './partner-types.actions';
import {
  selectPartnerTypesCrudError,
  selectPartnerTypesSaving,
} from './partner-types.crud.reducer';
import { partnerTypesList } from './partner-types.list';

/** Component-facing surface for the Partner Types screen. */
@Injectable()
export class PartnerTypesFacade {
  private readonly store = inject(Store);
  private readonly s = partnerTypesList.selectors;

  readonly rows: Signal<PartnerType[]> = this.store.selectSignal(this.s.selectRows);
  readonly loading = this.store.selectSignal(this.s.selectIsLoading);
  readonly page = this.store.selectSignal(this.s.selectPage);
  readonly sort = this.store.selectSignal(this.s.selectSort);
  readonly search = this.store.selectSignal(this.s.selectSearch);
  readonly filters = this.store.selectSignal(this.s.selectFilters) as Signal<PartnerTypeFilters>;
  readonly activeFilterCount = this.store.selectSignal(this.s.selectActiveFilterCount);
  readonly isEmpty = this.store.selectSignal(this.s.selectIsEmpty);
  readonly listError: Signal<ApiError | null> = this.store.selectSignal(this.s.selectError);

  readonly saving = this.store.selectSignal(selectPartnerTypesSaving);
  readonly crudError: Signal<ApiError | null> = this.store.selectSignal(selectPartnerTypesCrudError);

  setSearch(search: string): void {
    this.store.dispatch(partnerTypesList.actions.searchChanged({ search }));
  }

  setSort(sort: SortSpec[]): void {
    this.store.dispatch(partnerTypesList.actions.sortChanged({ sort }));
  }

  setPage(page: number, size: number): void {
    this.store.dispatch(partnerTypesList.actions.pageChanged({ page, size }));
  }

  setFilters(filters: PartnerTypeFilters): void {
    this.store.dispatch(
      partnerTypesList.actions.filtersChanged({
        filters: { ...filters } as Record<string, string | number | boolean | null | undefined>,
      }),
    );
  }

  clearFilters(): void {
    this.store.dispatch(partnerTypesList.actions.filtersCleared());
  }

  reload(): void {
    this.store.dispatch(partnerTypesList.actions.reload());
  }

  create(payload: CreatePartnerTypePayload): void {
    this.store.dispatch(PartnerTypeActions.create({ payload }));
  }

  update(id: Id, payload: UpdatePartnerTypePayload): void {
    this.store.dispatch(PartnerTypeActions.update({ id, payload }));
  }

  setStatus(id: Id, status: EntityStatus): void {
    this.store.dispatch(PartnerTypeActions.setStatus({ id, status }));
  }
}
