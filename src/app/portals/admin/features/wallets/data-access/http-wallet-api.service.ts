import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { WalletSummary, WalletTransaction } from '../models/wallet.model';
import { WalletApi } from './wallet-api.abstract';

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
    if (key === 'walletId') continue; // carried in the path, not the query string
    if (value !== null && value !== undefined && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

/** Real backend implementation of {@link WalletApi}. */
@Injectable()
export class HttpWalletApiService extends WalletApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/adm/wallets`;

  override listWallets(query: PageQuery): Observable<Page<WalletSummary>> {
    return this.http.get<any>(this.base, { params: toParams(query) }).pipe(map((res) => res.data));
  }

  override getWallet(id: Id): Observable<WalletSummary> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map((res) => res.data));
  }

  override listTransactions(walletId: Id, query: PageQuery): Observable<Page<WalletTransaction>> {
    return this.http
      .get<any>(`${this.base}/${walletId}/transactions`, { params: toParams(query) })
      .pipe(map((res) => res.data));
  }
}
