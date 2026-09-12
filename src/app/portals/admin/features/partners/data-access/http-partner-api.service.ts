import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import {
  CreatePartnerPayload,
  Partner,
  PartnerAccountStatus,
  PartnerPasswordResetResult,
  UpdatePartnerPayload,
} from '../models/partner.model';
import { PartnerApi } from './partner-api.abstract';

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

/** Real backend implementation of {@link PartnerApi}. */
@Injectable()
export class HttpPartnerApiService extends PartnerApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/adm/partners`;

  override list(query: PageQuery): Observable<Page<Partner>> {
    return this.http
      .get<{ data: Page<Partner> }>(this.base, { params: toParams(query) })
      .pipe(map((res) => res.data));
  }

  override get(id: Id): Observable<Partner> {
    return this.http
      .get<{ data: Partner }>(`${this.base}/${id}`)
      .pipe(map((res) => res.data));
  }

  override create(payload: CreatePartnerPayload): Observable<Partner> {
    return this.http
      .post<{ data: Partner }>(this.base, payload)
      .pipe(map((res) => res.data));
  }

  override update(id: Id, payload: UpdatePartnerPayload): Observable<Partner> {
    return this.http
      .put<{ data: Partner }>(`${this.base}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  override setStatus(id: Id, status: PartnerAccountStatus): Observable<Partner> {
    return this.http
      .patch<{ data: Partner }>(`${this.base}/${id}/status`, { status })
      .pipe(map((res) => res.data));
  }

  override resetPassword(id: Id): Observable<PartnerPasswordResetResult> {
    return this.http
      .post<{ data: PartnerPasswordResetResult }>(`${this.base}/${id}/reset-password`, {})
      .pipe(map((res) => res.data));
  }
}
