import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { Referral } from '../models/referral.model';
import { ReferralApi } from './referral-api.abstract';

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

/** Real backend implementation of {@link ReferralApi}. */
@Injectable()
export class HttpReferralApiService extends ReferralApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/admin/referrals`;

  override list(query: PageQuery): Observable<Page<Referral>> {
    return this.http.get<Page<Referral>>(this.base, { params: toParams(query) });
  }

  override get(id: Id): Observable<Referral> {
    return this.http.get<Referral>(`${this.base}/${id}`);
  }
}
