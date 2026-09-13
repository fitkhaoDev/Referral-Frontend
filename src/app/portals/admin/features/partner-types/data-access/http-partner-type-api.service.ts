import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import {
  CreatePartnerTypePayload,
  PartnerType,
  UpdatePartnerTypePayload,
} from '../models/partner-type.model';
import { PartnerTypeApi } from './partner-type-api.abstract';

/** Real backend implementation of {@link PartnerTypeApi} using server-side pagination. */
@Injectable()
export class HttpPartnerTypeApiService extends PartnerTypeApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/adm/partner-types`;

  override list(query: PageQuery): Observable<Page<PartnerType>> {
    let params = new HttpParams();

    if (query.size !== Number.MAX_SAFE_INTEGER) {
      params = params.set('page', String(query.page)).set('size', String(query.size));
    }

    if (query.search) {
      params = params.set('search', query.search);
    }

    for (const sort of query.sort ?? []) {
      params = params.append('sort', `${sort.field},${sort.direction}`);
    }

    for (const [key, value] of Object.entries(query.filters ?? {})) {
      if (value != null && value !== '') {
        params = params.set(key, String(value));
      }
    }

    return this.http
      .get<{ data: Page<PartnerType> }>(this.base, { params })
      .pipe(map((res) => res.data));
  }

  override get(id: Id): Observable<PartnerType> {
    return this.http
      .get<{ data: PartnerType }>(`${this.base}/${id}`)
      .pipe(map((res) => res.data));
  }

  override create(payload: CreatePartnerTypePayload): Observable<PartnerType> {
    return this.http
      .post<{ data: PartnerType }>(this.base, payload)
      .pipe(map((res) => res.data));
  }

  override update(id: Id, payload: UpdatePartnerTypePayload): Observable<PartnerType> {
    return this.http
      .put<{ data: PartnerType }>(`${this.base}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  override setStatus(id: Id, status: EntityStatus): Observable<PartnerType> {
    return this.http
      .patch<{ data: PartnerType }>(`${this.base}/${id}/status`, { status })
      .pipe(map((res) => res.data));
  }
}
