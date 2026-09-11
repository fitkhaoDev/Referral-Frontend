import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreateIncentiveRulePayload,
  IncentiveRule,
  UpdateIncentiveRulePayload,
} from '../models/incentive-rule.model';
import { IncentiveRuleApi } from './incentive-rule-api.abstract';

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

/** Real backend implementation of {@link IncentiveRuleApi}. */
@Injectable()
export class HttpIncentiveRuleApiService extends IncentiveRuleApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/admin/incentive-rules`;

  override list(query: PageQuery): Observable<Page<IncentiveRule>> {
    return this.http.get<Page<IncentiveRule>>(this.base, { params: toParams(query) });
  }

  override get(id: Id): Observable<IncentiveRule> {
    return this.http.get<IncentiveRule>(`${this.base}/${id}`);
  }

  override create(payload: CreateIncentiveRulePayload): Observable<IncentiveRule> {
    return this.http.post<IncentiveRule>(this.base, payload);
  }

  override update(id: Id, payload: UpdateIncentiveRulePayload): Observable<IncentiveRule> {
    return this.http.put<IncentiveRule>(`${this.base}/${id}`, payload);
  }

  override setStatus(id: Id, status: EntityStatus): Observable<IncentiveRule> {
    return this.http.patch<IncentiveRule>(`${this.base}/${id}/status`, { status });
  }
}
