import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateDiscountRulePayload,
  DiscountRule,
  UpdateDiscountRulePayload,
} from '../models/discount-rule.model';
import { DiscountRuleApi } from './discount-rule-api.abstract';

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

/** Real backend implementation of {@link DiscountRuleApi}. */
@Injectable()
export class HttpDiscountRuleApiService extends DiscountRuleApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/admin/discount-rules`;

  override list(query: PageQuery): Observable<Page<DiscountRule>> {
    return this.http.get<Page<DiscountRule>>(this.base, { params: toParams(query) });
  }

  override get(id: Id): Observable<DiscountRule> {
    return this.http.get<DiscountRule>(`${this.base}/${id}`);
  }

  override create(payload: CreateDiscountRulePayload): Observable<DiscountRule> {
    return this.http.post<DiscountRule>(this.base, payload);
  }

  override update(id: Id, payload: UpdateDiscountRulePayload): Observable<DiscountRule> {
    return this.http.put<DiscountRule>(`${this.base}/${id}`, payload);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<DiscountRule> {
    return this.http.patch<DiscountRule>(`${this.base}/${id}/status`, { status });
  }
}
