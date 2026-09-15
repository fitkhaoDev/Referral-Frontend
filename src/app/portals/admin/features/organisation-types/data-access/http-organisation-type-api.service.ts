import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateOrganisationTypePayload,
  OrganisationType,
  UpdateOrganisationTypePayload,
} from '../models/organisation-type.model';
import { OrganisationTypeApi } from './organisation-type-api.abstract';

/** Real backend implementation of {@link OrganisationTypeApi}. */
@Injectable()
export class HttpOrganisationTypeApiService extends OrganisationTypeApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/adm/organisation-types`;

  override list(query: PageQuery): Observable<Page<OrganisationType>> {
    let params = new HttpParams();
    if (query.size !== Number.MAX_SAFE_INTEGER) {
      params = params.set('page', String(query.page)).set('size', String(query.size));
    }
    if (query.search) params = params.set('search', query.search);
    for (const sort of query.sort ?? []) {
      params = params.append('sort', `${sort.field},${sort.direction}`);
    }
    for (const [key, value] of Object.entries(query.filters ?? {})) {
      if (value != null && value !== '') params = params.set(key, String(value));
    }
    return this.http
      .get<{ data: Page<OrganisationType> }>(this.base, { params })
      .pipe(map((res) => res.data));
  }

  override get(id: Id): Observable<OrganisationType> {
    return this.http
      .get<{ data: OrganisationType }>(`${this.base}/${id}`)
      .pipe(map((res) => res.data));
  }

  override create(payload: CreateOrganisationTypePayload): Observable<OrganisationType> {
    return this.http
      .post<{ data: OrganisationType }>(this.base, payload)
      .pipe(map((res) => res.data));
  }

  override update(id: Id, payload: UpdateOrganisationTypePayload): Observable<OrganisationType> {
    return this.http
      .put<{ data: OrganisationType }>(`${this.base}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  override setStatus(id: Id, status: EntityStatus): Observable<OrganisationType> {
    return this.http
      .patch<{ data: OrganisationType }>(`${this.base}/${id}/status`, { status })
      .pipe(map((res) => res.data));
  }
}
