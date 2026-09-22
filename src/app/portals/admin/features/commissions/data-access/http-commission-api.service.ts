import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { Commission } from '../models/commission.model';
import { CommissionApi } from './commission-api.abstract';

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

/** Real backend implementation of {@link CommissionApi}. */
@Injectable()
export class HttpCommissionApiService extends CommissionApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/adm/commissions`;

  override list(query: PageQuery): Observable<Page<Commission>> {
    return this.http.get<any>(this.base, { params: toParams(query) }).pipe(map((res) => res.data));
  }

  override get(id: Id): Observable<Commission> {
    return this.http.get<any>(`${this.base}/${id}`).pipe(map((res) => res.data));
  }
}
