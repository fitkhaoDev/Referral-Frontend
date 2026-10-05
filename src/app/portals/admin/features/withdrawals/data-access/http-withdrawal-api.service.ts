import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, throwError } from 'rxjs';
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

/**
 * Real backend implementation.
 *
 * Note: in the auto-payout model the backend no longer exposes
 * approve / mark-paid / mark-failed per-row — the vendor settles those.
 * The admin can only RETRY a FAILED row. The legacy methods on the API
 * abstract are kept for backward compatibility but return a clear 405
 * error if invoked.
 */
@Injectable()
export class HttpWithdrawalApiService extends WithdrawalApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/adm/withdrawals`;

  override list(query: PageQuery): Observable<Page<Withdrawal>> {
    return this.http.get<any>(this.base, { params: toParams(query) }).pipe(map((res) => res.data));
  }

  override get(id: Id): Observable<Withdrawal> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map((res) => res.data));
  }

  override getPolicy(): Observable<WithdrawalPolicy> {
    return this.http.get<any>(`${this.base}/policy`).pipe(map((res) => res.data));
  }

  retry(id: Id): Observable<Withdrawal> {
    return this.http.post<any>(`${this.base}/${id}/retry`, {}).pipe(map((res) => res.data));
  }

  override approve(_id: Id): Observable<Withdrawal> {
    return throwError(
      () =>
        new Error(
          'Admin approval is not supported in the auto-payout flow. Payouts fire automatically on request.',
        ),
    );
  }

  override reject(_id: Id, _payload: RejectWithdrawalPayload): Observable<Withdrawal> {
    return throwError(
      () => new Error('Per-request admin rejection is not supported in the auto-payout flow.'),
    );
  }

  override markProcessing(_id: Id): Observable<Withdrawal> {
    return throwError(() => new Error('Not applicable in the auto-payout flow.'));
  }

  override markPaid(_id: Id, _payload: MarkWithdrawalPaidPayload): Observable<Withdrawal> {
    return throwError(() => new Error('Not applicable in the auto-payout flow.'));
  }

  override markFailed(_id: Id, _payload: MarkWithdrawalFailedPayload): Observable<Withdrawal> {
    return throwError(() => new Error('Not applicable in the auto-payout flow.'));
  }

  /** Unused by the current UI but keeps the compiler happy. */
  _unused(): Observable<never> {
    return of<never>();
  }
}
