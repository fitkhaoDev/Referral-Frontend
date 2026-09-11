import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, merge, of, tap } from 'rxjs';
import { isApiError } from '@core/models/api-error.util';
import { ApiError } from '@core/models/api.model';
import { NotificationService } from '@core/notifications/notification.service';
import { buildListLoadEffect } from '@shared/store/build-list-load-effect';
import { DiscountRuleApi } from '../data-access/discount-rule-api.abstract';
import { DiscountRuleActions } from './discount-rules.actions';
import { discountRulesList } from './discount-rules.list';

function toApiError(err: unknown): ApiError {
  return isApiError(err)
    ? err
    : { status: 0, code: 'UNKNOWN', message: 'The action could not be completed. Please try again.' };
}

@Injectable()
export class DiscountRulesEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(DiscountRuleApi);
  private readonly notifications = inject(NotificationService);

  readonly load$ = createEffect(() =>
    buildListLoadEffect(this.actions$, this.store, discountRulesList, (query) =>
      this.api.list(query),
    ),
  );

  readonly create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DiscountRuleActions.create),
      exhaustMap(({ payload }) =>
        this.api.create(payload).pipe(
          map((rule) => DiscountRuleActions.createSuccess({ rule })),
          catchError((err) => of(DiscountRuleActions.createFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DiscountRuleActions.update),
      exhaustMap(({ id, payload }) =>
        this.api.update(id, payload).pipe(
          map((rule) => DiscountRuleActions.updateSuccess({ rule })),
          catchError((err) => of(DiscountRuleActions.updateFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly setStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DiscountRuleActions.setStatus),
      exhaustMap(({ id, status }) =>
        this.api.setStatus(id, status).pipe(
          map((rule) => DiscountRuleActions.setStatusSuccess({ rule })),
          catchError((err) => of(DiscountRuleActions.setStatusFailure({ error: toApiError(err) }))),
        ),
      ),
    ),
  );

  readonly reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        DiscountRuleActions.createSuccess,
        DiscountRuleActions.updateSuccess,
        DiscountRuleActions.setStatusSuccess,
      ),
      map(() => discountRulesList.actions.reload()),
    ),
  );

  readonly toast$ = createEffect(
    () =>
      merge(
        this.actions$.pipe(
          ofType(DiscountRuleActions.createSuccess),
          tap(({ rule }) => this.notifications.success(`Discount rule “${rule.name}” created`)),
        ),
        this.actions$.pipe(
          ofType(DiscountRuleActions.updateSuccess),
          tap(({ rule }) =>
            this.notifications.success(`Discount rule “${rule.name}” updated — now version ${rule.version}`),
          ),
        ),
        this.actions$.pipe(
          ofType(DiscountRuleActions.setStatusSuccess),
          tap(({ rule }) =>
            this.notifications.success(
              `“${rule.name}” is now ${rule.status === 'ACTIVE' ? 'active' : 'inactive'}`,
            ),
          ),
        ),
        this.actions$.pipe(
          ofType(DiscountRuleActions.setStatusFailure),
          tap(({ error }) => this.notifications.fromApiError(error)),
        ),
      ),
    { dispatch: false },
  );
}
