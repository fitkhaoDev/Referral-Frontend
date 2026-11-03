import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '@core/config/app-config.token';
import {
  AdminWithdrawalRequest,
  AdminWithdrawalRequestDetail,
  AdminWithdrawalRequestPage,
  MarkFailedPayload,
  MarkSuccessPayload,
  WithdrawalRequestStatus,
} from '../models/withdrawal-request.model';

@Injectable({ providedIn: 'root' })
export class WithdrawalRequestApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/adm/withdrawal-requests`;

  list(
    page: number,
    size: number,
    filters: {
      status?: WithdrawalRequestStatus;
      search?: string;
      fromDate?: string;
      toDate?: string;
    } = {},
  ): Observable<AdminWithdrawalRequestPage> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (filters.status) params = params.set('status', filters.status);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    return this.http.get<any>(this.base, { params }).pipe(map((res) => res.data));
  }

  get(id: string): Observable<AdminWithdrawalRequestDetail> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map((res) => res.data));
  }

  markSuccess(id: string, payload: MarkSuccessPayload): Observable<AdminWithdrawalRequest> {
    return this.http
      .post<any>(`${this.base}/${id}/mark-success`, payload)
      .pipe(map((res) => res.data));
  }

  markFailed(id: string, payload: MarkFailedPayload): Observable<AdminWithdrawalRequest> {
    return this.http
      .post<any>(`${this.base}/${id}/mark-failed`, payload)
      .pipe(map((res) => res.data));
  }
}
