import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, map, merge, of, tap } from 'rxjs';
import { isApiError } from '@core/models/api-error.util';
import { ApiError } from '@core/models/api.model';
import { NotificationService } from '@core/notifications/notification.service';
import { buildListLoadEffect } from '@shared/store/build-list-load-effect';
import { OrganisationMemberApi } from '../data-access/organisation-member-api.abstract';
import { OrganisationMemberActions } from './organisation-members.actions';
import { organisationMembersList } from './organisation-members.list';

function toApiError(err: unknown): ApiError {
  return isApiError(err)
    ? err
    : { status: 0, code: 'UNKNOWN', message: 'The action could not be completed. Please try again.' };
}

@Injectable()
export class OrganisationMembersEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(OrganisationMemberApi);
  private readonly notifications = inject(NotificationService);

  readonly load$ = createEffect(() =>
    buildListLoadEffect(this.actions$, this.store, organisationMembersList, (query) =>
      this.api.list(query),
    ),
  );

  readonly create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganisationMemberActions.create),
      exhaustMap(({ payload }) =>
        this.api.create(payload).pipe(
          map((member) => OrganisationMemberActions.createSuccess({ member })),
          catchError((err) =>
            of(OrganisationMemberActions.createFailure({ error: toApiError(err) })),
          ),
        ),
      ),
    ),
  );

  readonly update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganisationMemberActions.update),
      exhaustMap(({ id, payload }) =>
        this.api.update(id, payload).pipe(
          map((member) => OrganisationMemberActions.updateSuccess({ member })),
          catchError((err) =>
            of(OrganisationMemberActions.updateFailure({ error: toApiError(err) })),
          ),
        ),
      ),
    ),
  );

  readonly setStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrganisationMemberActions.setStatus),
      exhaustMap(({ id, status }) =>
        this.api.setStatus(id, status).pipe(
          map((member) => OrganisationMemberActions.setStatusSuccess({ member })),
          catchError((err) =>
            of(OrganisationMemberActions.setStatusFailure({ error: toApiError(err) })),
          ),
        ),
      ),
    ),
  );

  readonly reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        OrganisationMemberActions.createSuccess,
        OrganisationMemberActions.updateSuccess,
        OrganisationMemberActions.setStatusSuccess,
      ),
      map(() => organisationMembersList.actions.reload()),
    ),
  );

  readonly toast$ = createEffect(
    () =>
      merge(
        this.actions$.pipe(
          ofType(OrganisationMemberActions.createSuccess),
          tap(({ member }) =>
            this.notifications.success(`${member.name} added to ${member.organisationName}`),
          ),
        ),
        this.actions$.pipe(
          ofType(OrganisationMemberActions.updateSuccess),
          tap(({ member }) => this.notifications.success(`${member.name}’s details updated`)),
        ),
        this.actions$.pipe(
          ofType(OrganisationMemberActions.setStatusSuccess),
          tap(({ member }) =>
            this.notifications.success(
              `${member.name} ${member.status === 'ACTIVE' ? 'reactivated' : 'deactivated'}`,
            ),
          ),
        ),
        this.actions$.pipe(
          ofType(OrganisationMemberActions.setStatusFailure),
          tap(({ error }) => this.notifications.fromApiError(error)),
        ),
      ),
    { dispatch: false },
  );
}
