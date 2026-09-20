import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { OrganisationApi } from '../features/organisations/data-access/organisation-api.abstract';
import { OrganisationTypeApi } from '../features/organisation-types/data-access/organisation-type-api.abstract';
import { PartnerTypeApi } from '../features/partner-types/data-access/partner-type-api.abstract';

/**
 * Scope-picker options for discount / incentive rule editors: active partner types,
 * organisation types and organisations. Each rule feature module must also provide
 * the three API implementations (`partnerTypeApiProvider`, `organisationTypeApiProvider`,
 * `organisationApiProvider`).
 */
@Injectable()
export class RuleScopeOptionsService {
  private readonly partnerTypes = inject(PartnerTypeApi);
  private readonly organisationTypes = inject(OrganisationTypeApi);
  private readonly organisations = inject(OrganisationApi);

  readonly partnerTypeOptions$: Observable<SelectOption[]> = this.partnerTypes
    .list({
      page: 0,
      size: Number.MAX_SAFE_INTEGER,
      sort: [{ field: 'name', direction: 'asc' }],
      search: '',
      filters: { status: 'ACTIVE' },
    })
    .pipe(
      map((page) => page.items.map((t) => ({ value: t.id, label: t.name }))),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  readonly organisationTypeOptions$: Observable<SelectOption[]> = this.organisationTypes
    .list({
      page: 0,
      size: Number.MAX_SAFE_INTEGER,
      sort: [{ field: 'name', direction: 'asc' }],
      search: '',
      filters: { status: 'ACTIVE' },
    })
    .pipe(
      map((page) => page.items.map((t) => ({ value: t.id, label: t.name }))),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  readonly organisationOptions$: Observable<SelectOption[]> = this.organisations
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
