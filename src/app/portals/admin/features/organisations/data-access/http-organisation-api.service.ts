import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
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
  const isFetchAll = query.size === Number.MAX_SAFE_INTEGER;
  let params = new HttpParams();
  if (!isFetchAll) {
    params = params.set('page', String(query.page)).set('size', String(query.size));
  }
  if (query.search) params = params.set('search', query.search);
  for (const s of query.sort ?? []) {
    params = params.append('sort', `${s.field},${s.direction}`);
  }
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
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/adm/organisations`;

  override list(query: PageQuery): Observable<Page<Organisation>> {
    return this.http
      .get<{ data: Page<Organisation> }>(this.base, { params: toParams(query) })
      .pipe(map((res) => res.data));
  }

  override get(id: Id): Observable<Organisation> {
    return this.http
      .get<{ data: Organisation }>(`${this.base}/${id}`)
      .pipe(map((res) => res.data));
  }

  override create(payload: CreateOrganisationPayload): Observable<Organisation> {
    return this.http
      .post<{ data: Organisation }>(this.base, payload)
      .pipe(map((res) => res.data));
  }

  override update(id: Id, payload: UpdateOrganisationPayload): Observable<Organisation> {
    return this.http
      .put<{ data: Organisation }>(`${this.base}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  override setStatus(id: Id, status: EntityStatus): Observable<Organisation> {
    return this.http
      .patch<{ data: Organisation }>(`${this.base}/${id}/status`, { status })
      .pipe(map((res) => res.data));
  }

  override resetPassword(id: Id): Observable<PasswordResetResult> {
    return this.http
      .post<{ data: PasswordResetResult }>(`${this.base}/${id}/reset-password`, {})
      .pipe(map((res) => res.data));
  }
}
