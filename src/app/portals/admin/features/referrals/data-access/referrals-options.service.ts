import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { OrganisationApi } from '../../organisations/data-access/organisation-api.abstract';
import { ReferralEventApi } from '../../referral-events/data-access/referral-event-api.abstract';

/** Filter dropdown options for the Referrals screen. Cached for the module lifetime. */
@Injectable()
export class ReferralsOptionsService {
  private readonly organisations = inject(OrganisationApi);
  private readonly events = inject(ReferralEventApi);

  readonly organisationOptions$: Observable<SelectOption[]> = this.organisations
    .list({
      page: 0,
      size: 500,
      sort: [{ field: 'name', direction: 'asc' }],
      search: '',
      filters: {},
    })
    .pipe(
      map((page) => page.items.map((o) => ({ value: o.id, label: `${o.name} · ${o.referralCode}` }))),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  readonly eventOptions$: Observable<SelectOption[]> = this.events
    .list({
      page: 0,
      size: 200,
      sort: [{ field: 'sortOrder', direction: 'asc' }],
      search: '',
      filters: {},
    })
    .pipe(
      map((page) => page.items.map((e) => ({ value: e.code, label: e.name }))),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
}
