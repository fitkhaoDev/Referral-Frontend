import { Injectable, inject } from '@angular/core';
import { Observable, catchError, defer, map, of, shareReplay } from 'rxjs';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { OrganisationApi } from '../../organisations/data-access/organisation-api.abstract';
import { ReferralEventApi } from '../../referral-events/data-access/referral-event-api.abstract';

/** Filter dropdown options for the Commissions screen. Cached for the module lifetime. */
@Injectable()
export class CommissionsOptionsService {
  private readonly organisations = inject(OrganisationApi);
  private readonly events = inject(ReferralEventApi);

  readonly organisationOptions$: Observable<SelectOption[]> = defer(() =>
    this.organisations.list({
      page: 0,
      size: Number.MAX_SAFE_INTEGER,
      sort: [{ field: 'name', direction: 'asc' }],
      search: '',
      filters: {},
    }),
  ).pipe(
    map((page) => (page?.items ?? []).map((o) => ({ value: o.id, label: `${o.name} · ${o.referralCode}` }))),
    catchError(() => of([] as SelectOption[])),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  readonly eventOptions$: Observable<SelectOption[]> = defer(() =>
    this.events.list({
      page: 0,
      size: Number.MAX_SAFE_INTEGER,
      sort: [{ field: 'sortOrder', direction: 'asc' }],
      search: '',
      filters: {},
    }),
  ).pipe(
    map((page) => (page?.items ?? []).map((e) => ({ value: e.code, label: e.name }))),
    catchError(() => of([] as SelectOption[])),
    shareReplay({ bufferSize: 1, refCount: false }),
  );
}
