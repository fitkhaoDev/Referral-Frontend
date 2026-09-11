import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { OrganisationTypeApi } from '../../organisation-types/data-access/organisation-type-api.abstract';

/**
 * Active organisation types as `<select>` options for the organisation form + list filter.
 *
 * Contract: `GET /api/admin/organisation-types?status=ACTIVE&size=200&sort=name,asc`.
 */
@Injectable()
export class OrganisationTypeOptionsService {
  private readonly api = inject(OrganisationTypeApi);

  readonly options$: Observable<SelectOption[]> = this.api
    .list({
      page: 0,
      size: 200,
      sort: [{ field: 'name', direction: 'asc' }],
      search: '',
      filters: { status: 'ACTIVE' },
    })
    .pipe(
      map((page) => page.items.map((t) => ({ value: t.id, label: t.name }))),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
}
