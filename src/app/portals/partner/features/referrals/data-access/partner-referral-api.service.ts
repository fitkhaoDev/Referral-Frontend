import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG } from '@core/config/app-config.token';
import {
  PartnerReferralFilters,
  PartnerReferralPage,
} from '../models/partner-referral.model';

@Injectable({ providedIn: 'root' })
export class PartnerReferralApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiBaseUrl}/partner/me`;

  list(page: number, size: number, filters: PartnerReferralFilters = {}): Observable<PartnerReferralPage> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (filters.search) params = params.set('search', filters.search);
    if (filters.commissionStatus) params = params.set('commissionStatus', filters.commissionStatus);
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    return this.http
      .get<any>(`${this.base}/referrals`, { params })
      .pipe(map((res) => res.data));
  }
}
