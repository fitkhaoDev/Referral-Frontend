import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { APP_CONFIG } from '@core/config/app-config.token';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { EntityStatus } from '@core/models/common.model';
import { paginate } from '@core/data-access/mock/mock-http.util';
import {
  CreatePartnerTypePayload,
  PartnerType,
  UpdatePartnerTypePayload,
} from '../models/partner-type.model';
import { PartnerTypeApi } from './partner-type-api.abstract';

/** Real backend implementation of {@link PartnerTypeApi} with client-side pagination. */
@Injectable()
export class HttpPartnerTypeApiService extends PartnerTypeApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/adm/partner-types`;

  private cachedItems: PartnerType[] | null = null;

  private loadAll(): Observable<PartnerType[]> {
    if (this.cachedItems !== null) {
      return of(this.cachedItems);
    }
    return this.http
      .get<Page<PartnerType>>(this.base, {
        params: new HttpParams().set('page', '0').set('size', '1000'),
      })
      .pipe(
        map((res) => {
          this.cachedItems = [...res.items];
          return this.cachedItems;
        }),
      );
  }

  private invalidate(): void {
    this.cachedItems = null;
  }

  override list(query: PageQuery): Observable<Page<PartnerType>> {
    return this.loadAll().pipe(
      map((items) =>
        paginate(items, query, {
          searchable: (r) => `${r.name} ${r.code}`,
          filter: (r, f) => (f['status'] ? r.status === f['status'] : true),
          comparator: (sort) => (a, b) => {
            switch (sort.field) {
              case 'code':
                return a.code.localeCompare(b.code);
              case 'partnerCount':
                return a.partnerCount - b.partnerCount;
              case 'status':
                return a.status.localeCompare(b.status);
              case 'createdAt':
                return a.createdAt.localeCompare(b.createdAt);
              default:
                return a.name.localeCompare(b.name);
            }
          },
        }),
      ),
    );
  }

  override get(id: Id): Observable<PartnerType> {
    return this.http.get<PartnerType>(`${this.base}/${id}`);
  }

  override create(payload: CreatePartnerTypePayload): Observable<PartnerType> {
    return this.http
      .post<PartnerType>(this.base, payload)
      .pipe(tap(() => this.invalidate()));
  }

  override update(id: Id, payload: UpdatePartnerTypePayload): Observable<PartnerType> {
    return this.http
      .put<PartnerType>(`${this.base}/${id}`, payload)
      .pipe(tap(() => this.invalidate()));
  }

  override setStatus(id: Id, status: EntityStatus): Observable<PartnerType> {
    return this.http
      .patch<PartnerType>(`${this.base}/${id}/status`, { status })
      .pipe(tap(() => this.invalidate()));
  }
}
