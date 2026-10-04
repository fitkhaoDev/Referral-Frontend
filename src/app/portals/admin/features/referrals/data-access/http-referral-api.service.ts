import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { Referral } from '../models/referral.model';
import { ReferralApi } from './referral-api.abstract';

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

/** Real backend implementation of {@link ReferralApi}. */
@Injectable()
export class HttpReferralApiService extends ReferralApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/adm/referrals`;

  override list(query: PageQuery): Observable<Page<Referral>> {
    return this.http.get<any>(this.base, { params: toParams(query) }).pipe(map((res) => res.data));
  }

  override get(id: Id): Observable<Referral> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map((res) => res.data));
  }
}
