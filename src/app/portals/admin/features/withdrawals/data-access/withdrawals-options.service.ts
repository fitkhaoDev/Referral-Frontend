import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { OrganisationApi } from '../../organisations/data-access/organisation-api.abstract';

/** Filter dropdown options for the Withdrawals screen. Cached for the module lifetime. */
@Injectable()
export class WithdrawalsOptionsService {
  private readonly organisations = inject(OrganisationApi);

  readonly organisationOptions$: Observable<SelectOption[]> = this.organisations
    .list({ page: 0, size: 500, sort: [{ field: 'name', direction: 'asc' }], search: '', filters: {} })
    .pipe(
      map((page) => page.items.map((o) => ({ value: o.id, label: `${o.name} · ${o.referralCode}` }))),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
}
