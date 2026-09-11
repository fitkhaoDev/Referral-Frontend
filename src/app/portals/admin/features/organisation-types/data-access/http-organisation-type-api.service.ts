import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateOrganisationTypePayload,
  OrganisationType,
  UpdateOrganisationTypePayload,
} from '../models/organisation-type.model';
import { OrganisationTypeApi } from './organisation-type-api.abstract';

function toParams(query: PageQuery): HttpParams {
  let params = new HttpParams().set('page', String(query.page)).set('size', String(query.size));
  if (query.search) params = params.set('search', query.search);
  const sort = query.sort?.[0];
  if (sort) params = params.set('sort', `${sort.field},${sort.direction}`);
  for (const [key, value] of Object.entries(query.filters ?? {})) {
    if (value !== null && value !== undefined && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

/** Real backend implementation of {@link OrganisationTypeApi}. */
@Injectable()
export class HttpOrganisationTypeApiService extends OrganisationTypeApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/admin/organisation-types`;

  override list(query: PageQuery): Observable<Page<OrganisationType>> {
    return this.http.get<Page<OrganisationType>>(this.base, { params: toParams(query) });
  }

  override get(id: Id): Observable<OrganisationType> {
    return this.http.get<OrganisationType>(`${this.base}/${id}`);
  }

  override create(payload: CreateOrganisationTypePayload): Observable<OrganisationType> {
    return this.http.post<OrganisationType>(this.base, payload);
  }

  override update(id: Id, payload: UpdateOrganisationTypePayload): Observable<OrganisationType> {
    return this.http.put<OrganisationType>(`${this.base}/${id}`, payload);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<OrganisationType> {
    return this.http.patch<OrganisationType>(`${this.base}/${id}/status`, { status });
  }
}
