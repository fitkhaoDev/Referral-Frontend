import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateOrganisationMemberPayload,
  OrganisationMember,
  UpdateOrganisationMemberPayload,
} from '../models/organisation-member.model';
import { OrganisationMemberApi } from './organisation-member-api.abstract';

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

/** Real backend implementation of {@link OrganisationMemberApi}. */
@Injectable()
export class HttpOrganisationMemberApiService extends OrganisationMemberApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/admin/organisation-members`;

  override list(query: PageQuery): Observable<Page<OrganisationMember>> {
    return this.http.get<Page<OrganisationMember>>(this.base, { params: toParams(query) });
  }

  override get(id: Id): Observable<OrganisationMember> {
    return this.http.get<OrganisationMember>(`${this.base}/${id}`);
  }

  override create(payload: CreateOrganisationMemberPayload): Observable<OrganisationMember> {
    return this.http.post<OrganisationMember>(this.base, payload);
  }

  override update(
    id: Id,
    payload: UpdateOrganisationMemberPayload,
  ): Observable<OrganisationMember> {
    return this.http.put<OrganisationMember>(`${this.base}/${id}`, payload);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<OrganisationMember> {
    return this.http.patch<OrganisationMember>(`${this.base}/${id}/status`, { status });
  }
}
