import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { Commission } from '../models/commission.model';
import { CommissionApi } from './commission-api.abstract';

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

/** Real backend implementation of {@link CommissionApi}. */
@Injectable()
export class HttpCommissionApiService extends CommissionApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/admin/commissions`;

  override list(query: PageQuery): Observable<Page<Commission>> {
    return this.http.get<Page<Commission>>(this.base, { params: toParams(query) });
  }

  override get(id: Id): Observable<Commission> {
    return this.http.get<Commission>(`${this.base}/${id}`);
  }
}
