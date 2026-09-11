import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreatePartnerTypePayload,
  PartnerType,
  UpdatePartnerTypePayload,
} from '../models/partner-type.model';
import { PartnerTypeApi } from './partner-type-api.abstract';

function toParams(query: PageQuery): HttpParams {
  let params = new HttpParams()
    .set('page', String(query.page))
    .set('size', String(query.size));
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

/** Real backend implementation of {@link PartnerTypeApi}. */
@Injectable()
export class HttpPartnerTypeApiService extends PartnerTypeApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/admin/partner-types`;

  override list(query: PageQuery): Observable<Page<PartnerType>> {
    return this.http.get<Page<PartnerType>>(this.base, { params: toParams(query) });
  }

  override get(id: Id): Observable<PartnerType> {
    return this.http.get<PartnerType>(`${this.base}/${id}`);
  }

  override create(payload: CreatePartnerTypePayload): Observable<PartnerType> {
    return this.http.post<PartnerType>(this.base, payload);
  }

  override update(id: Id, payload: UpdatePartnerTypePayload): Observable<PartnerType> {
    return this.http.put<PartnerType>(`${this.base}/${id}`, payload);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<PartnerType> {
    return this.http.patch<PartnerType>(`${this.base}/${id}/status`, { status });
  }
}
