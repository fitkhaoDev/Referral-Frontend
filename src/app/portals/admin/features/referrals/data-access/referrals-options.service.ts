import { Injectable, inject } from '@angular/core';
import { Observable, catchError, defer, map, of, shareReplay } from 'rxjs';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { OrganisationApi } from '../../organisations/data-access/organisation-api.abstract';

/** Filter dropdown options for the Referrals screen. Cached for the module lifetime. */
@Injectable()
export class ReferralsOptionsService {
  private readonly organisations = inject(OrganisationApi);

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
}
