import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { WalletSummary, WalletTransaction } from '../models/wallet.model';
import { WalletApi } from './wallet-api.abstract';

function toParams(query: PageQuery): HttpParams {
  let params = new HttpParams().set('page', String(query.page)).set('size', String(query.size));
  if (query.search) params = params.set('search', query.search);
  const sort = query.sort?.[0];
  if (sort) params = params.set('sort', `${sort.field},${sort.direction}`);
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
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/admin/wallets`;

  override listWallets(query: PageQuery): Observable<Page<WalletSummary>> {
    return this.http.get<Page<WalletSummary>>(this.base, { params: toParams(query) });
  }

  override getWallet(id: Id): Observable<WalletSummary> {
    return this.http.get<WalletSummary>(`${this.base}/${id}`);
  }

  override listTransactions(walletId: Id, query: PageQuery): Observable<Page<WalletTransaction>> {
    return this.http.get<Page<WalletTransaction>>(`${this.base}/${walletId}/transactions`, {
      params: toParams(query),
    });
  }
}
