import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '@core/config/app-config.token';
import {
  AddBankAccountPayload,
  EditBankAccountPayload,
  PartnerBankAccount,
  PartnerBankAccountList,
  PartnerProfile,
  PartnerWalletSummary,
  PartnerWithdrawal,
  PartnerWithdrawalPage,
  UpdatePartnerProfilePayload,
  WithdrawalQuote,
} from '../models/finance.model';

/** Single partner-portal HTTP service for the whole finance surface. */
@Injectable({ providedIn: 'root' })
export class PartnerFinanceApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/partner`;

  // ─ Profile ───────────────────────────────────────────────────────────────
  getMyProfile(): Observable<PartnerProfile> {
    return this.http.get<any>(`${this.base}/me/profile`).pipe(map((res) => res.data));
  }
  updateMyProfile(payload: UpdatePartnerProfilePayload): Observable<PartnerProfile> {
    return this.http
      .put<any>(`${this.base}/me/profile`, payload)
      .pipe(map((res) => res.data));
  }

  // ─ Bank accounts ─────────────────────────────────────────────────────────
  listBankAccounts(): Observable<PartnerBankAccountList> {
    return this.http
      .get<any>(`${this.base}/bank-accounts`)
      .pipe(map((res) => res.data));
  }
  addBankAccount(payload: AddBankAccountPayload): Observable<PartnerBankAccount> {
    return this.http
      .post<any>(`${this.base}/bank-accounts`, payload)
      .pipe(map((res) => res.data));
  }
  editBankAccount(id: string, payload: EditBankAccountPayload): Observable<PartnerBankAccount> {
    return this.http
      .put<any>(`${this.base}/bank-accounts/${id}`, payload)
      .pipe(map((res) => res.data));
  }
  makePrimary(id: string): Observable<PartnerBankAccount> {
    return this.http
      .post<any>(`${this.base}/bank-accounts/${id}/make-primary`, {})
      .pipe(map((res) => res.data));
  }
  deleteBankAccount(id: string, currentPassword: string): Observable<void> {
    return this.http.request<any>('delete', `${this.base}/bank-accounts/${id}`, {
      body: { currentPassword },
    }).pipe(map(() => void 0));
  }

  // ─ Wallet + withdrawals ──────────────────────────────────────────────────
  wallet(): Observable<PartnerWalletSummary> {
    return this.http.get<any>(`${this.base}/wallet`).pipe(map((res) => res.data));
  }

  quote(amount: number): Observable<WithdrawalQuote> {
    const params = new HttpParams().set('amount', String(amount));
    return this.http
      .get<any>(`${this.base}/withdrawals-quote`, { params })
      .pipe(map((res) => res.data));
  }

  listWithdrawals(page = 0, size = 10): Observable<PartnerWithdrawalPage> {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));
    return this.http
      .get<any>(`${this.base}/withdrawals`, { params })
      .pipe(map((res) => res.data));
  }

  requestWithdrawal(payload: { amount: number; bankAccountId: string; requesterNote?: string }): Observable<PartnerWithdrawal> {
    return this.http
      .post<any>(`${this.base}/withdrawals`, payload)
      .pipe(map((res) => res.data));
  }

  cancelWithdrawal(id: string): Observable<PartnerWithdrawal> {
    return this.http
      .post<any>(`${this.base}/withdrawals/${id}/cancel`, {})
      .pipe(map((res) => res.data));
  }
}
