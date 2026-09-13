import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { PartnerTypeApi } from '../../partner-types/data-access/partner-type-api.abstract';

/**
 * Active partner types as `<select>` options for the enrolment form and list filter.
 * Cached for the lifetime of the feature module.
 *
 * Contract: `GET /api/admin/partner-types?status=ACTIVE&size=200&sort=name,asc`.
 */
@Injectable()
export class PartnerTypeOptionsService {
  private readonly api = inject(PartnerTypeApi);

  readonly options$: Observable<SelectOption[]> = this.api
    .list({
      page: 0,
      size: Number.MAX_SAFE_INTEGER,
      sort: [{ field: 'name', direction: 'asc' }],
      search: '',
      filters: { status: 'ACTIVE' },
    })
    .pipe(
      map((page) => page.items.map((t) => ({ value: t.id, label: `${t.name}` }))),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
}
