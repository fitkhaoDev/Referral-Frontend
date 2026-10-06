import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { PartnerReferralApi } from '../../data-access/partner-referral-api.service';
import {
  PARTNER_REFERRAL_COMMISSION_STATUS_LABEL,
  PartnerReferralCommissionStatus,
  PartnerReferralPage,
  PartnerReferralRow,
} from '../../models/partner-referral.model';

@Component({
  selector: 'app-partner-referrals-page',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-referrals-page.component.html',
  styleUrl: './partner-referrals-page.component.css',
})
export class PartnerReferralsPageComponent {
  private readonly api = inject(PartnerReferralApi);
  private readonly fb = inject(FormBuilder);

  protected readonly STATUS_LABEL = PARTNER_REFERRAL_COMMISSION_STATUS_LABEL;
  protected readonly STATUSES: PartnerReferralCommissionStatus[] = [
    'AVAILABLE',
    'REVERSED',
  ];

  protected readonly filters = this.fb.nonNullable.group({
    search: [''],
    commissionStatus: [''],
    fromDate: [''],
    toDate: [''],
  });

  private readonly page$ = new BehaviorSubject<number>(0);
  private readonly size = 10;

  protected readonly loading = signal(false);

  protected readonly data = toSignal<PartnerReferralPage | null>(
    combineLatest([
      this.page$,
      this.filters.valueChanges.pipe(
        startWith(this.filters.getRawValue()),
        debounceTime(250),
        distinctUntilChanged(
          (a, b) =>
            a.search === b.search &&
            a.commissionStatus === b.commissionStatus &&
            a.fromDate === b.fromDate &&
            a.toDate === b.toDate,
        ),
      ),
    ]).pipe(
      tap(() => this.loading.set(true)),
      switchMap(([page, raw]) =>
        this.api
          .list(page, this.size, {
            search: raw.search?.trim() || undefined,
            commissionStatus: (raw.commissionStatus as PartnerReferralCommissionStatus) || undefined,
            fromDate: raw.fromDate || undefined,
            toDate: raw.toDate || undefined,
          })
          .pipe(catchError(() => of(null as PartnerReferralPage | null))),
      ),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: null },
  );

  protected readonly rows = (): readonly PartnerReferralRow[] => this.data()?.items ?? [];

  protected statusTone(status: PartnerReferralCommissionStatus): 'success' | 'warning' | 'danger' | 'neutral' | 'info' {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REVERSED':
        return 'danger';
      case 'WITHDRAWN':
        return 'info';
      case 'NONE':
      default:
        return 'neutral';
    }
  }

  protected canPrev(): boolean {
    const d = this.data();
    return !!d && d.page > 0;
  }
  protected canNext(): boolean {
    const d = this.data();
    return !!d && d.page + 1 < d.totalPages;
  }
  protected prev(): void {
    if (this.canPrev()) this.page$.next(this.page$.value - 1);
  }
  protected next(): void {
    if (this.canNext()) this.page$.next(this.page$.value + 1);
  }

  protected resetFilters(): void {
    this.filters.reset({ search: '', commissionStatus: '', fromDate: '', toDate: '' });
    this.page$.next(0);
  }
}
