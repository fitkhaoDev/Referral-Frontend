import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { catchError, defer, of, tap } from 'rxjs';
import { NotificationService } from '@core/notifications/notification.service';
import { WithdrawalRequestApi } from '../../data-access/withdrawal-request-api.service';
import {
  AdminWithdrawalRequestDetail,
  WITHDRAWAL_REQUEST_STATUS_LABEL,
  WithdrawalRequestStatus,
} from '../../models/withdrawal-request.model';

export interface WithdrawalRequestDetailDialogData {
  readonly id: string;
}

type Mode = 'view' | 'success' | 'failed';

@Component({
  selector: 'app-withdrawal-request-detail-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './withdrawal-request-detail-dialog.component.html',
  styleUrl: './withdrawal-request-detail-dialog.component.css',
})
export class WithdrawalRequestDetailDialogComponent {
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly api = inject(WithdrawalRequestApi);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  protected readonly data = inject<WithdrawalRequestDetailDialogData>(DIALOG_DATA);

  protected readonly STATUS_LABEL = WITHDRAWAL_REQUEST_STATUS_LABEL;
  protected readonly mode = signal<Mode>('view');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly detail = toSignal<AdminWithdrawalRequestDetail | null>(
    defer(() => this.api.get(this.data.id)).pipe(
      tap(() => this.error.set(null)),
      catchError((err) => {
        this.error.set(err?.error?.message ?? err?.message ?? 'Could not load request.');
        return of(null as AdminWithdrawalRequestDetail | null);
      }),
    ),
    { initialValue: null },
  );

  protected readonly successForm = this.fb.nonNullable.group({
    transactionId: ['', [Validators.required, Validators.maxLength(64)]],
    adminComment: ['', [Validators.maxLength(500)]],
  });

  protected readonly failForm = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.maxLength(300)]],
    adminComment: ['', [Validators.maxLength(500)]],
  });

  protected readonly copiedField = signal<string | null>(null);

  protected copy(label: string, value: string | null | undefined): void {
    if (!value) return;
    void navigator.clipboard
      .writeText(value)
      .then(() => {
        this.copiedField.set(label);
        this.notifications.success(`${label} copied.`);
        setTimeout(() => {
          if (this.copiedField() === label) this.copiedField.set(null);
        }, 1500);
      })
      .catch(() => this.notifications.error('Could not copy. Please copy manually.'));
  }

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

  protected startSuccess(): void {
    this.mode.set('success');
    this.error.set(null);
  }
  protected startFail(): void {
    this.mode.set('failed');
    this.error.set(null);
  }
  protected backToView(): void {
    this.mode.set('view');
    this.error.set(null);
  }

  protected submitSuccess(): void {
    if (this.successForm.invalid) {
      this.successForm.markAllAsTouched();
      return;
    }
    const v = this.successForm.getRawValue();
    this.submitting.set(true);
    this.api
      .markSuccess(this.data.id, {
        transactionId: v.transactionId.trim(),
        adminComment: v.adminComment?.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.notifications.success('Request marked as success.');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? err?.message ?? 'Could not mark as success.');
        },
      });
  }

  protected submitFail(): void {
    if (this.failForm.invalid) {
      this.failForm.markAllAsTouched();
      return;
    }
    const v = this.failForm.getRawValue();
    this.submitting.set(true);
    this.api
      .markFailed(this.data.id, {
        reason: v.reason.trim(),
        adminComment: v.adminComment?.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.notifications.success('Request marked as failed. Amount returned to wallet.');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? err?.message ?? 'Could not mark as failed.');
        },
      });
  }

  protected close(): void {
    this.dialogRef.close(false);
  }
}
