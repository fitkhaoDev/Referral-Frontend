import { Dialog } from '@angular/cdk/dialog';
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
import { WithdrawalRequestApi } from '../../data-access/withdrawal-request-api.service';
import {
  AdminWithdrawalRequest,
  AdminWithdrawalRequestPage,
  WITHDRAWAL_REQUEST_STATUS_LABEL,
  WithdrawalRequestStatus,
} from '../../models/withdrawal-request.model';
import { WithdrawalRequestDetailDialogComponent } from '../../components/withdrawal-request-detail-dialog/withdrawal-request-detail-dialog.component';

@Component({
  selector: 'app-withdrawal-request-list',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './withdrawal-request-list.component.html',
  styleUrl: './withdrawal-request-list.component.css',
})
export class WithdrawalRequestListComponent {
  private readonly api = inject(WithdrawalRequestApi);
  private readonly dialog = inject(Dialog);
  private readonly fb = inject(FormBuilder);

  protected readonly STATUS_LABEL = WITHDRAWAL_REQUEST_STATUS_LABEL;
  protected readonly STATUSES: WithdrawalRequestStatus[] = ['PENDING', 'SUCCESS', 'FAILED'];

  protected readonly filters = this.fb.nonNullable.group({
    status: [''],
    search: [''],
    fromDate: [''],
    toDate: [''],
  });

  private readonly page$ = new BehaviorSubject<number>(0);
  private readonly refreshTick$ = new BehaviorSubject<number>(0);
  private readonly size = 10;

  protected readonly loading = signal(false);

  protected readonly data = toSignal<AdminWithdrawalRequestPage | null>(
    combineLatest([
      this.page$,
      this.refreshTick$,
      this.filters.valueChanges.pipe(
        startWith(this.filters.getRawValue()),
        debounceTime(250),
        distinctUntilChanged(
          (a, b) =>
            a.status === b.status &&
            a.search === b.search &&
            a.fromDate === b.fromDate &&
            a.toDate === b.toDate,
        ),
      ),
    ]).pipe(
      tap(() => this.loading.set(true)),
      switchMap(([page, _tick, raw]) =>
        this.api
          .list(page, this.size, {
            status: (raw.status as WithdrawalRequestStatus) || undefined,
            search: raw.search?.trim() || undefined,
            fromDate: raw.fromDate || undefined,
            toDate: raw.toDate || undefined,
          })
          .pipe(catchError(() => of(null as AdminWithdrawalRequestPage | null))),
      ),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: null },
  );

  protected tone(status: WithdrawalRequestStatus): 'success' | 'warning' | 'danger' {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'danger';
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
    this.filters.reset({ status: '', search: '', fromDate: '', toDate: '' });
    this.page$.next(0);
  }

  protected openDetail(row: AdminWithdrawalRequest): void {
    const ref = this.dialog.open<boolean | undefined>(WithdrawalRequestDetailDialogComponent, {
      data: { id: row.id },
      panelClass: 'fk-dialog-panel',
      width: 'min(720px, 95vw)',
      autoFocus: 'dialog',
    });
    ref.closed.subscribe((changed) => {
      if (changed) this.refreshTick$.next(this.refreshTick$.value + 1);
    });
  }
}
