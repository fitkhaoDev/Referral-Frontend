import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiError, Id, SortSpec } from '@core/models/api.model';
import {
  CreatePartnerPayload,
  Partner,
  PartnerAccountStatus,
  PartnerFilters,
  PartnerPasswordResetResult,
  UpdatePartnerPayload,
} from '../models/partner.model';
import { PartnerActions } from './partners.actions';
import {
  selectPartnerDetail,
  selectPartnerDetailLoadError,
  selectPartnerDetailLoading,
  selectPartnerResetResult,
  selectPartnerSaveError,
  selectPartnerSaving,
} from './partners.detail.reducer';
import { partnersList } from './partners.list';

/** Component-facing surface for the Partners screens (list + detail). */
@Injectable()
export class PartnersFacade {
  private readonly store = inject(Store);
  private readonly s = partnersList.selectors;

  // ── List ──────────────────────────────────────────────────────────────
  readonly rows: Signal<Partner[]> = this.store.selectSignal(this.s.selectRows);
  readonly loading = this.store.selectSignal(this.s.selectIsLoading);
  readonly page = this.store.selectSignal(this.s.selectPage);
  readonly sort = this.store.selectSignal(this.s.selectSort);
  readonly search = this.store.selectSignal(this.s.selectSearch);
  readonly filters = this.store.selectSignal(this.s.selectFilters) as Signal<PartnerFilters>;
  readonly activeFilterCount = this.store.selectSignal(this.s.selectActiveFilterCount);
  readonly isEmpty = this.store.selectSignal(this.s.selectIsEmpty);
  readonly listError: Signal<ApiError | null> = this.store.selectSignal(this.s.selectError);

  // ── Detail ────────────────────────────────────────────────────────────
  readonly detail: Signal<Partner | null> = this.store.selectSignal(selectPartnerDetail);
  readonly detailLoading = this.store.selectSignal(selectPartnerDetailLoading);
  readonly detailLoadError: Signal<ApiError | null> =
    this.store.selectSignal(selectPartnerDetailLoadError);
  readonly saving = this.store.selectSignal(selectPartnerSaving);
  readonly saveError: Signal<ApiError | null> = this.store.selectSignal(selectPartnerSaveError);
  readonly resetResult: Signal<PartnerPasswordResetResult | null> =
    this.store.selectSignal(selectPartnerResetResult);

  setSearch(search: string): void {
    this.store.dispatch(partnersList.actions.searchChanged({ search }));
  }
  setSort(sort: SortSpec[]): void {
    this.store.dispatch(partnersList.actions.sortChanged({ sort }));
  }
  setPage(page: number, size: number): void {
    this.store.dispatch(partnersList.actions.pageChanged({ page, size }));
  }
  setFilters(filters: PartnerFilters): void {
    this.store.dispatch(
      partnersList.actions.filtersChanged({
        filters: { ...filters } as Record<string, string | number | boolean | null | undefined>,
      }),
    );
  }
  clearFilters(): void {
    this.store.dispatch(partnersList.actions.filtersCleared());
  }
  reload(): void {
    this.store.dispatch(partnersList.actions.reload());
  }

  loadDetail(id: Id): void {
    this.store.dispatch(PartnerActions.loadDetail({ id }));
  }
  clearDetail(): void {
    this.store.dispatch(PartnerActions.detailCleared());
  }
  clearResetResult(): void {
    this.store.dispatch(PartnerActions.resetResultCleared());
  }

  create(payload: CreatePartnerPayload): void {
    this.store.dispatch(PartnerActions.create({ payload }));
  }
  update(id: Id, payload: UpdatePartnerPayload): void {
    this.store.dispatch(PartnerActions.update({ id, payload }));
  }
  setStatus(id: Id, status: PartnerAccountStatus): void {
    this.store.dispatch(PartnerActions.setStatus({ id, status }));
  }
  resetPassword(id: Id): void {
    this.store.dispatch(PartnerActions.resetPassword({ id }));
  }
}
