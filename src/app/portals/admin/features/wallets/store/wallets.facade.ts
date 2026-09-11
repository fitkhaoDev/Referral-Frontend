import { Injectable, Signal, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiError, Id, SortSpec } from '@core/models/api.model';
import {
  WalletSummary,
  WalletSummaryFilters,
  WalletTransaction,
  WalletTransactionFilters,
} from '../models/wallet.model';
import { walletLedgerList } from './wallet-ledger.list';
import { WalletActions } from './wallets.actions';
import {
  selectWalletSummary,
  selectWalletSummaryLoadError,
  selectWalletSummaryLoading,
} from './wallets.detail.reducer';
import { walletsList } from './wallets.list';

const LEDGER_USER_FILTER_KEYS = ['type', 'status', 'fromDate', 'toDate'] as const;

/** Component-facing surface for the Wallets screens (owner directory + detail ledger). */
@Injectable()
export class WalletsFacade {
  private readonly store = inject(Store);
  private readonly w = walletsList.selectors;
  private readonly l = walletLedgerList.selectors;

  // ── Owner directory ────────────────────────────────────────────────────────
  readonly rows: Signal<WalletSummary[]> = this.store.selectSignal(this.w.selectRows);
  readonly loading = this.store.selectSignal(this.w.selectIsLoading);
  readonly page = this.store.selectSignal(this.w.selectPage);
  readonly sort = this.store.selectSignal(this.w.selectSort);
  readonly search = this.store.selectSignal(this.w.selectSearch);
  readonly filters = this.store.selectSignal(this.w.selectFilters) as Signal<WalletSummaryFilters>;
  readonly activeFilterCount = this.store.selectSignal(this.w.selectActiveFilterCount);
  readonly isEmpty = this.store.selectSignal(this.w.selectIsEmpty);
  readonly listError: Signal<ApiError | null> = this.store.selectSignal(this.w.selectError);

  setSearch(search: string): void {
    this.store.dispatch(walletsList.actions.searchChanged({ search }));
  }
  setSort(sort: SortSpec[]): void {
    this.store.dispatch(walletsList.actions.sortChanged({ sort }));
  }
  setPage(page: number, size: number): void {
    this.store.dispatch(walletsList.actions.pageChanged({ page, size }));
  }
  setFilters(filters: WalletSummaryFilters): void {
    this.store.dispatch(
      walletsList.actions.filtersChanged({
        filters: { ...filters } as Record<string, string | number | boolean | null | undefined>,
      }),
    );
  }
  clearFilters(): void {
    this.store.dispatch(walletsList.actions.filtersCleared());
  }
  reload(): void {
    this.store.dispatch(walletsList.actions.reload());
  }

  // ── Detail: summary ────────────────────────────────────────────────────────
  readonly summary: Signal<WalletSummary | null> = this.store.selectSignal(selectWalletSummary);
  readonly summaryLoading = this.store.selectSignal(selectWalletSummaryLoading);
  readonly summaryLoadError: Signal<ApiError | null> = this.store.selectSignal(
    selectWalletSummaryLoadError,
  );

  loadSummary(id: Id): void {
    this.store.dispatch(WalletActions.loadSummary({ id }));
  }
  clearDetail(): void {
    this.store.dispatch(WalletActions.detailCleared());
  }

  // ── Detail: ledger ─────────────────────────────────────────────────────────
  readonly ledgerRows: Signal<WalletTransaction[]> = this.store.selectSignal(this.l.selectRows);
  readonly ledgerLoading = this.store.selectSignal(this.l.selectIsLoading);
  readonly ledgerPage = this.store.selectSignal(this.l.selectPage);
  readonly ledgerSort = this.store.selectSignal(this.l.selectSort);
  readonly ledgerSearch = this.store.selectSignal(this.l.selectSearch);
  readonly ledgerFilters = this.store.selectSignal(
    this.l.selectFilters,
  ) as Signal<WalletTransactionFilters>;
  readonly ledgerActiveFilterCount = this.store.selectSignal(this.l.selectActiveFilterCount);
  readonly ledgerIsEmpty = this.store.selectSignal(this.l.selectIsEmpty);
  readonly ledgerError: Signal<ApiError | null> = this.store.selectSignal(this.l.selectError);

  /** Point the ledger at a wallet and (re)load its first page. */
  openLedger(walletId: Id): void {
    this.store.dispatch(walletLedgerList.actions.filtersChanged({ filters: { walletId } }));
  }
  setLedgerSearch(search: string): void {
    this.store.dispatch(walletLedgerList.actions.searchChanged({ search }));
  }
  setLedgerSort(sort: SortSpec[]): void {
    this.store.dispatch(walletLedgerList.actions.sortChanged({ sort }));
  }
  setLedgerPage(page: number, size: number): void {
    this.store.dispatch(walletLedgerList.actions.pageChanged({ page, size }));
  }
  setLedgerFilters(filters: WalletTransactionFilters): void {
    this.store.dispatch(
      walletLedgerList.actions.filtersChanged({
        filters: { ...filters } as Record<string, string | number | boolean | null | undefined>,
      }),
    );
  }
  /** Clear only the user-facing ledger filters, keeping the wallet in scope. */
  clearLedgerFilters(): void {
    const cleared = Object.fromEntries(LEDGER_USER_FILTER_KEYS.map((k) => [k, undefined]));
    this.store.dispatch(walletLedgerList.actions.filtersChanged({ filters: cleared }));
    this.store.dispatch(walletLedgerList.actions.searchChanged({ search: '' }));
  }
}
