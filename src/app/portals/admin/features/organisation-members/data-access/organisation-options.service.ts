import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { OrganisationApi } from '../../organisations/data-access/organisation-api.abstract';

/**
 * Active organisations as `<select>` options for the member form + list filter.
 *
 * Contract: `GET /api/adm/organisations?status=ACTIVE&sort=name,asc` (no page/size — fetch all).
 */
@Injectable()
export class OrganisationOptionsService {
  private readonly api = inject(OrganisationApi);

  readonly options$: Observable<SelectOption[]> = this.api
    .list({
      page: 0,
      size: Number.MAX_SAFE_INTEGER,
      sort: [{ field: 'name', direction: 'asc' }],
      search: '',
      filters: { status: 'ACTIVE' },
    })
    .pipe(
      map((page) => page.items.map((o) => ({ value: o.id, label: `${o.name} · ${o.referralCode}` }))),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
}
