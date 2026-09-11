import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { OrganisationApi } from '../../organisations/data-access/organisation-api.abstract';

/**
 * Active organisations as `<select>` options for the member form + list filter.
 *
 * Contract: `GET /api/admin/organisations?status=ACTIVE&size=500&sort=name,asc`.
 */
@Injectable()
export class OrganisationOptionsService {
  private readonly api = inject(OrganisationApi);

  readonly options$: Observable<SelectOption[]> = this.api
    .list({
      page: 0,
      size: 500,
      sort: [{ field: 'name', direction: 'asc' }],
      search: '',
      filters: { status: 'ACTIVE' },
    })
    .pipe(
      map((page) => page.items.map((o) => ({ value: o.id, label: `${o.name} · ${o.referralCode}` }))),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
}
