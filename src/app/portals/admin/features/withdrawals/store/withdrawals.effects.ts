import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, merge, of, switchMap, tap } from 'rxjs';
import { isApiError } from '@core/models/api-error.util';
import { ApiError } from '@core/models/api.model';
import { NotificationService } from '@core/notifications/notification.service';
import { buildListLoadEffect } from '@shared/store/build-list-load-effect';
import { WITHDRAWAL_STATUS_LABEL } from '../models/withdrawal.model';
import { WithdrawalApi } from '../data-access/withdrawal-api.abstract';
import { WithdrawalActions } from './withdrawals.actions';
import { withdrawalsList } from './withdrawals.list';

function toApiError(err: unknown): ApiError {
  return isApiError(err)
    ? err
    : { status: 0, code: 'UNKNOWN', message: 'The action could not be completed. Please try again.' };
}

@Injectable()
export class WithdrawalsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(WithdrawalApi);
  private readonly notifications = inject(NotificationService);

  readonly load$ = createEffect(() =>
    buildListLoadEffect(this.actions$, this.store, withdrawalsList, (query) => this.api.list(query)),
  );

  readonly loadDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WithdrawalActions.loadDetail),
      switchMap(({ id }) =>
        this.api.get(id).pipe(
          map((withdrawal) => WithdrawalActions.loadDetailSuccess({ withdrawal })),
          catchError((err) => of(WithdrawalActions.loadDetailFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly loadPolicy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WithdrawalActions.loadPolicy),
      switchMap(() =>
        this.api.getPolicy().pipe(
          map((policy) => WithdrawalActions.loadPolicySuccess({ policy })),
          catchError((err) => of(WithdrawalActions.loadPolicyFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly approve$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WithdrawalActions.approve),
      exhaustMap(({ id }) =>
        this.api.approve(id).pipe(
          map((withdrawal) => WithdrawalActions.actionSuccess({ withdrawal, action: 'APPROVE' })),
          catchError((err) => of(WithdrawalActions.actionFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly reject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WithdrawalActions.reject),
      exhaustMap(({ id, reason }) =>
        this.api.reject(id, { reason }).pipe(
          map((withdrawal) => WithdrawalActions.actionSuccess({ withdrawal, action: 'REJECT' })),
          catchError((err) => of(WithdrawalActions.actionFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly markProcessing$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WithdrawalActions.markProcessing),
      exhaustMap(({ id }) =>
        this.api.markProcessing(id).pipe(
          map((withdrawal) =>
            WithdrawalActions.actionSuccess({ withdrawal, action: 'MARK_PROCESSING' }),
          ),
          catchError((err) => of(WithdrawalActions.actionFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly markPaid$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WithdrawalActions.markPaid),
      exhaustMap(({ id, paymentReference }) =>
        this.api.markPaid(id, { paymentReference }).pipe(
          map((withdrawal) => WithdrawalActions.actionSuccess({ withdrawal, action: 'MARK_PAID' })),
          catchError((err) => of(WithdrawalActions.actionFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly markFailed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WithdrawalActions.markFailed),
      exhaustMap(({ id, reason }) =>
        this.api.markFailed(id, { reason }).pipe(
          map((withdrawal) => WithdrawalActions.actionSuccess({ withdrawal, action: 'MARK_FAILED' })),
          catchError((err) => of(WithdrawalActions.actionFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly reloadListAfterAction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WithdrawalActions.actionSuccess),
      map(() => withdrawalsList.actions.reload()),
    ),
  );

  readonly toast$ = createEffect(
    () =>
      merge(
        this.actions$.pipe(
          ofType(WithdrawalActions.actionSuccess),
          tap(({ withdrawal }) =>
            this.notifications.success(
              `${withdrawal.reference} is now ${WITHDRAWAL_STATUS_LABEL[
                withdrawal.status
              ].toLowerCase()}`,
            ),
          ),
        ),
        this.actions$.pipe(
          ofType(WithdrawalActions.actionFailure),
          tap(({ error }) => {
            if (error.status !== 422) this.notifications.fromApiError(error);
          }),
        ),
      ),
    { dispatch: false },
  );
}
