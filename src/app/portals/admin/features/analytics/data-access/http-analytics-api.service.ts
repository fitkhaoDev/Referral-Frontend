import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '@core/config/app-config.token';
import { AnalyticsOverview, AnalyticsQuery } from '../models/analytics.model';
import { AnalyticsApi } from './analytics-api.abstract';

/** Real backend implementation of {@link AnalyticsApi}. */
@Injectable()
export class HttpAnalyticsApiService extends AnalyticsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/admin/analytics`;

  override getOverview(query: AnalyticsQuery): Observable<AnalyticsOverview> {
    let params = new HttpParams().set('granularity', query.granularity);
    if (query.fromDate) params = params.set('fromDate', query.fromDate);
    if (query.toDate) params = params.set('toDate', query.toDate);
    return this.http.get<AnalyticsOverview>(`${this.base}/overview`, { params });
  }
}
