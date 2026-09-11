import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import {
  MarkWithdrawalFailedPayload,
  MarkWithdrawalPaidPayload,
  RejectWithdrawalPayload,
  Withdrawal,
  WithdrawalPolicy,
} from '../models/withdrawal.model';
import { WithdrawalApi } from './withdrawal-api.abstract';

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

/** Real backend implementation of {@link WithdrawalApi}. */
@Injectable()
export class HttpWithdrawalApiService extends WithdrawalApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/admin/withdrawals`;

  override list(query: PageQuery): Observable<Page<Withdrawal>> {
    return this.http.get<Page<Withdrawal>>(this.base, { params: toParams(query) });
  }

  override get(id: Id): Observable<Withdrawal> {
    return this.http.get<Withdrawal>(`${this.base}/${id}`);
  }

  override getPolicy(): Observable<WithdrawalPolicy> {
    return this.http.get<WithdrawalPolicy>(`${this.base}/policy`);
  }

  override approve(id: Id): Observable<Withdrawal> {
    return this.http.post<Withdrawal>(`${this.base}/${id}/approve`, {});
  }

  override reject(id: Id, payload: RejectWithdrawalPayload): Observable<Withdrawal> {
    return this.http.post<Withdrawal>(`${this.base}/${id}/reject`, payload);
  }

  override markProcessing(id: Id): Observable<Withdrawal> {
    return this.http.post<Withdrawal>(`${this.base}/${id}/processing`, {});
  }

  override markPaid(id: Id, payload: MarkWithdrawalPaidPayload): Observable<Withdrawal> {
    return this.http.post<Withdrawal>(`${this.base}/${id}/paid`, payload);
  }

  override markFailed(id: Id, payload: MarkWithdrawalFailedPayload): Observable<Withdrawal> {
    return this.http.post<Withdrawal>(`${this.base}/${id}/failed`, payload);
  }
}
