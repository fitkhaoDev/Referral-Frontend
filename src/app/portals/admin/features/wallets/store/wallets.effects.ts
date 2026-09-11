import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap } from 'rxjs';
import { isApiError } from '@core/models/api-error.util';
import { ApiError, PageQuery } from '@core/models/api.model';
import { buildListLoadEffect } from '@shared/store/build-list-load-effect';
import { WalletApi } from '../data-access/wallet-api.abstract';
import { walletLedgerList } from './wallet-ledger.list';
import { WalletActions } from './wallets.actions';
import { walletsList } from './wallets.list';

function toApiError(err: unknown): ApiError {
  return isApiError(err)
    ? err
    : { status: 0, code: 'UNKNOWN', message: 'The action could not be completed. Please try again.' };
}

function walletIdOf(query: PageQuery): string {
  return String(query.filters?.['walletId'] ?? '');
}

@Injectable()
export class WalletsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(WalletApi);

  readonly loadWallets$ = createEffect(() =>
    buildListLoadEffect(this.actions$, this.store, walletsList, (query) =>
      this.api.listWallets(query),
    ),
  );

  readonly loadLedger$ = createEffect(() =>
    buildListLoadEffect(this.actions$, this.store, walletLedgerList, (query) =>
      this.api.listTransactions(walletIdOf(query), query),
    ),
  );

  readonly loadSummary$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.loadSummary),
      switchMap(({ id }) =>
        this.api.getWallet(id).pipe(
          map((summary) => WalletActions.loadSummarySuccess({ summary })),
          catchError((err) => of(WalletActions.loadSummaryFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );
}
