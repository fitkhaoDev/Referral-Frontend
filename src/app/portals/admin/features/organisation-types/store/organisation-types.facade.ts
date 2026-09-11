import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiError, Id, SortSpec } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateOrganisationTypePayload,
  OrganisationType,
  OrganisationTypeFilters,
  UpdateOrganisationTypePayload,
} from '../models/organisation-type.model';
import { OrganisationTypeActions } from './organisation-types.actions';
import {
  selectOrganisationTypesCrudError,
  selectOrganisationTypesSaving,
} from './organisation-types.crud.reducer';
import { organisationTypesList } from './organisation-types.list';

/** Component-facing surface for the Organisation Types screen. */
@Injectable()
export class OrganisationTypesFacade {
  private readonly store = inject(Store);
  private readonly s = organisationTypesList.selectors;

  readonly rows: Signal<OrganisationType[]> = this.store.selectSignal(this.s.selectRows);
  readonly loading = this.store.selectSignal(this.s.selectIsLoading);
  readonly page = this.store.selectSignal(this.s.selectPage);
  readonly sort = this.store.selectSignal(this.s.selectSort);
  readonly search = this.store.selectSignal(this.s.selectSearch);
  readonly filters = this.store.selectSignal(this.s.selectFilters) as Signal<OrganisationTypeFilters>;
  readonly activeFilterCount = this.store.selectSignal(this.s.selectActiveFilterCount);
  readonly isEmpty = this.store.selectSignal(this.s.selectIsEmpty);
  readonly listError: Signal<ApiError | null> = this.store.selectSignal(this.s.selectError);

  readonly saving = this.store.selectSignal(selectOrganisationTypesSaving);
  readonly crudError: Signal<ApiError | null> = this.store.selectSignal(
    selectOrganisationTypesCrudError,
  );

  setSearch(search: string): void {
    this.store.dispatch(organisationTypesList.actions.searchChanged({ search }));
  }

  setSort(sort: SortSpec[]): void {
    this.store.dispatch(organisationTypesList.actions.sortChanged({ sort }));
  }

  setPage(page: number, size: number): void {
    this.store.dispatch(organisationTypesList.actions.pageChanged({ page, size }));
  }

  setFilters(filters: OrganisationTypeFilters): void {
    this.store.dispatch(
      organisationTypesList.actions.filtersChanged({
        filters: { ...filters } as Record<string, string | number | boolean | null | undefined>,
      }),
    );
  }

  clearFilters(): void {
    this.store.dispatch(organisationTypesList.actions.filtersCleared());
  }

  reload(): void {
    this.store.dispatch(organisationTypesList.actions.reload());
  }

  create(payload: CreateOrganisationTypePayload): void {
    this.store.dispatch(OrganisationTypeActions.create({ payload }));
  }

  update(id: Id, payload: UpdateOrganisationTypePayload): void {
    this.store.dispatch(OrganisationTypeActions.update({ id, payload }));
  }

  setStatus(id: Id, status: EntityStatus): void {
    this.store.dispatch(OrganisationTypeActions.setStatus({ id, status }));
  }
}
