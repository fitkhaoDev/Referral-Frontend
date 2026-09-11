import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus, PasswordResetResult } from '@core/models/common.model';
import {
  CreateOrganisationPayload,
  Organisation,
  UpdateOrganisationPayload,
} from '../models/organisation.model';
import { OrganisationApi } from './organisation-api.abstract';

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

/** Real backend implementation of {@link OrganisationApi}. */
@Injectable()
export class HttpOrganisationApiService extends OrganisationApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/admin/organisations`;

  override list(query: PageQuery): Observable<Page<Organisation>> {
    return this.http.get<Page<Organisation>>(this.base, { params: toParams(query) });
  }

  override get(id: Id): Observable<Organisation> {
    return this.http.get<Organisation>(`${this.base}/${id}`);
  }

  override create(payload: CreateOrganisationPayload): Observable<Organisation> {
    return this.http.post<Organisation>(this.base, payload);
  }

  override update(id: Id, payload: UpdateOrganisationPayload): Observable<Organisation> {
    return this.http.put<Organisation>(`${this.base}/${id}`, payload);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<Organisation> {
    return this.http.patch<Organisation>(`${this.base}/${id}/status`, { status });
  }

  override resetPassword(id: Id): Observable<PasswordResetResult> {
    return this.http.post<PasswordResetResult>(`${this.base}/${id}/reset-password`, {});
  }
}
