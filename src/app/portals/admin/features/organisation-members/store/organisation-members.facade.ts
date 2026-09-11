import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiError, Id, SortSpec } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateOrganisationMemberPayload,
  OrganisationMember,
  OrganisationMemberFilters,
  UpdateOrganisationMemberPayload,
} from '../models/organisation-member.model';
import { OrganisationMemberActions } from './organisation-members.actions';
import {
  selectOrganisationMembersCrudError,
  selectOrganisationMembersSaving,
} from './organisation-members.crud.reducer';
import { organisationMembersList } from './organisation-members.list';

/** Component-facing surface for the Organisation Members screen. */
@Injectable()
export class OrganisationMembersFacade {
  private readonly store = inject(Store);
  private readonly s = organisationMembersList.selectors;

  readonly rows: Signal<OrganisationMember[]> = this.store.selectSignal(this.s.selectRows);
  readonly loading = this.store.selectSignal(this.s.selectIsLoading);
  readonly page = this.store.selectSignal(this.s.selectPage);
  readonly sort = this.store.selectSignal(this.s.selectSort);
  readonly search = this.store.selectSignal(this.s.selectSearch);
  readonly filters = this.store.selectSignal(this.s.selectFilters) as Signal<OrganisationMemberFilters>;
  readonly activeFilterCount = this.store.selectSignal(this.s.selectActiveFilterCount);
  readonly isEmpty = this.store.selectSignal(this.s.selectIsEmpty);
  readonly listError: Signal<ApiError | null> = this.store.selectSignal(this.s.selectError);

  readonly saving = this.store.selectSignal(selectOrganisationMembersSaving);
  readonly crudError: Signal<ApiError | null> = this.store.selectSignal(
    selectOrganisationMembersCrudError,
  );

  setSearch(search: string): void {
    this.store.dispatch(organisationMembersList.actions.searchChanged({ search }));
  }
  setSort(sort: SortSpec[]): void {
    this.store.dispatch(organisationMembersList.actions.sortChanged({ sort }));
  }
  setPage(page: number, size: number): void {
    this.store.dispatch(organisationMembersList.actions.pageChanged({ page, size }));
  }
  setFilters(filters: OrganisationMemberFilters): void {
    this.store.dispatch(
      organisationMembersList.actions.filtersChanged({
        filters: { ...filters } as Record<string, string | number | boolean | null | undefined>,
      }),
    );
  }
  clearFilters(): void {
    this.store.dispatch(organisationMembersList.actions.filtersCleared());
  }
  reload(): void {
    this.store.dispatch(organisationMembersList.actions.reload());
  }

  create(payload: CreateOrganisationMemberPayload): void {
    this.store.dispatch(OrganisationMemberActions.create({ payload }));
  }
  update(id: Id, payload: UpdateOrganisationMemberPayload): void {
    this.store.dispatch(OrganisationMemberActions.update({ id, payload }));
  }
  setStatus(id: Id, status: EntityStatus): void {
    this.store.dispatch(OrganisationMemberActions.setStatus({ id, status }));
  }
}
