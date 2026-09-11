import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiError, Id, SortSpec } from '@core/models/api.model';
import { EntityStatus, PasswordResetResult } from '@core/models/common.model';
import {
  CreateOrganisationPayload,
  Organisation,
  OrganisationFilters,
  UpdateOrganisationPayload,
} from '../models/organisation.model';
import { OrganisationActions } from './organisations.actions';
import {
  selectOrganisationDetail,
  selectOrganisationDetailLoadError,
  selectOrganisationDetailLoading,
  selectOrganisationResetResult,
  selectOrganisationSaveError,
  selectOrganisationSaving,
} from './organisations.detail.reducer';
import { organisationsList } from './organisations.list';

/** Component-facing surface for the Organisations screens (list + detail). */
@Injectable()
export class OrganisationsFacade {
  private readonly store = inject(Store);
  private readonly s = organisationsList.selectors;

  readonly rows: Signal<Organisation[]> = this.store.selectSignal(this.s.selectRows);
  readonly loading = this.store.selectSignal(this.s.selectIsLoading);
  readonly page = this.store.selectSignal(this.s.selectPage);
  readonly sort = this.store.selectSignal(this.s.selectSort);
  readonly search = this.store.selectSignal(this.s.selectSearch);
  readonly filters = this.store.selectSignal(this.s.selectFilters) as Signal<OrganisationFilters>;
  readonly activeFilterCount = this.store.selectSignal(this.s.selectActiveFilterCount);
  readonly isEmpty = this.store.selectSignal(this.s.selectIsEmpty);
  readonly listError: Signal<ApiError | null> = this.store.selectSignal(this.s.selectError);

  readonly detail: Signal<Organisation | null> = this.store.selectSignal(selectOrganisationDetail);
  readonly detailLoading = this.store.selectSignal(selectOrganisationDetailLoading);
  readonly detailLoadError: Signal<ApiError | null> = this.store.selectSignal(
    selectOrganisationDetailLoadError,
  );
  readonly saving = this.store.selectSignal(selectOrganisationSaving);
  readonly saveError: Signal<ApiError | null> = this.store.selectSignal(selectOrganisationSaveError);
  readonly resetResult: Signal<PasswordResetResult | null> = this.store.selectSignal(
    selectOrganisationResetResult,
  );

  setSearch(search: string): void {
    this.store.dispatch(organisationsList.actions.searchChanged({ search }));
  }
  setSort(sort: SortSpec[]): void {
    this.store.dispatch(organisationsList.actions.sortChanged({ sort }));
  }
  setPage(page: number, size: number): void {
    this.store.dispatch(organisationsList.actions.pageChanged({ page, size }));
  }
  setFilters(filters: OrganisationFilters): void {
    this.store.dispatch(
      organisationsList.actions.filtersChanged({
        filters: { ...filters } as Record<string, string | number | boolean | null | undefined>,
      }),
    );
  }
  clearFilters(): void {
    this.store.dispatch(organisationsList.actions.filtersCleared());
  }
  reload(): void {
    this.store.dispatch(organisationsList.actions.reload());
  }

  loadDetail(id: Id): void {
    this.store.dispatch(OrganisationActions.loadDetail({ id }));
  }
  clearDetail(): void {
    this.store.dispatch(OrganisationActions.detailCleared());
  }
  clearResetResult(): void {
    this.store.dispatch(OrganisationActions.resetResultCleared());
  }

  create(payload: CreateOrganisationPayload): void {
    this.store.dispatch(OrganisationActions.create({ payload }));
  }
  update(id: Id, payload: UpdateOrganisationPayload): void {
    this.store.dispatch(OrganisationActions.update({ id, payload }));
  }
  setStatus(id: Id, status: EntityStatus): void {
    this.store.dispatch(OrganisationActions.setStatus({ id, status }));
  }
  resetPassword(id: Id): void {
    this.store.dispatch(OrganisationActions.resetPassword({ id }));
  }
}
