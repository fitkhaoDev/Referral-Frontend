import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateReferralEventPayload,
  ReferralEvent,
  UpdateReferralEventPayload,
} from '../models/referral-event.model';
import { ReferralEventApi } from './referral-event-api.abstract';

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

/** Real backend implementation of {@link ReferralEventApi}. */
@Injectable()
export class HttpReferralEventApiService extends ReferralEventApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/admin/referral-events`;

  override list(query: PageQuery): Observable<Page<ReferralEvent>> {
    return this.http.get<Page<ReferralEvent>>(this.base, { params: toParams(query) });
  }

  override get(id: Id): Observable<ReferralEvent> {
    return this.http.get<ReferralEvent>(`${this.base}/${id}`);
  }

  override create(payload: CreateReferralEventPayload): Observable<ReferralEvent> {
    return this.http.post<ReferralEvent>(this.base, payload);
  }

  override update(id: Id, payload: UpdateReferralEventPayload): Observable<ReferralEvent> {
    return this.http.put<ReferralEvent>(`${this.base}/${id}`, payload);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<ReferralEvent> {
    return this.http.patch<ReferralEvent>(`${this.base}/${id}/status`, { status });
  }
}
