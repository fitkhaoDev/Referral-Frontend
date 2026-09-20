import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  let params = new HttpParams();
  if (query.size !== Number.MAX_SAFE_INTEGER) {
    params = params.set('page', String(query.page)).set('size', String(query.size));
  }
  if (query.search) params = params.set('search', query.search);
  for (const sort of query.sort ?? []) {
    params = params.append('sort', `${sort.field},${sort.direction}`);
  }
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
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/adm/organisation-members`;

  override list(query: PageQuery): Observable<Page<OrganisationMember>> {
    return this.http.get<any>(this.base, { params: toParams(query) }).pipe(map(res => res.data));
  }

  override get(id: Id): Observable<OrganisationMember> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map(res => res.data));
  }

  override create(payload: CreateOrganisationMemberPayload): Observable<OrganisationMember> {
    return this.http.post<any>(this.base, payload).pipe(map(res => res.data));
  }

  override update(id: Id, payload: UpdateOrganisationMemberPayload): Observable<OrganisationMember> {
    return this.http.put<any>(`${this.base}/${id}`, payload).pipe(map(res => res.data));
  }

  override setStatus(id: Id, status: EntityStatus): Observable<OrganisationMember> {
    return this.http.patch<any>(`${this.base}/${id}/status`, { isActive: status === 'ACTIVE' }).pipe(map(res => res.data));
  }
}
