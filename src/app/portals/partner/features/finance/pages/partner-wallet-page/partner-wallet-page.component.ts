import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, defer, map, of } from 'rxjs';
import { PartnerFinanceApi } from '../../data-access/partner-finance-api.service';
import { PartnerWalletSummary } from '../../models/finance.model';
import { WithdrawDialogComponent } from '../../components/withdraw-dialog/withdraw-dialog.component';

@Component({
  selector: 'app-partner-wallet-page',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-wallet-page.component.html',
  styleUrl: './partner-wallet-page.component.css',
})
export class PartnerWalletPageComponent {
  private readonly api = inject(PartnerFinanceApi);
  private readonly dialog = inject(Dialog);
  private readonly router = inject(Router);
  protected readonly refreshTick = signal(0);

  protected readonly wallet = toSignal(
    defer(() => this.api.wallet()).pipe(
      catchError(() => of(null as PartnerWalletSummary | null)),
    ),
    { initialValue: null },
  );

  protected readonly recentWithdrawals = toSignal(
    defer(() => this.api.listWithdrawals(0, 5)).pipe(
      map((p) => p.items),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );

  protected openWithdraw(): void {
    const ref = this.dialog.open<string | undefined>(WithdrawDialogComponent, {
      panelClass: 'fk-dialog-panel',
      autoFocus: 'dialog',
      width: 'min(560px, 95vw)',
    });
    ref.closed.subscribe(() => this.refreshTick.update((v) => v + 1));
  }

  protected goToWithdrawals(): void {
    void this.router.navigate(['/partner/withdrawals']);
  }

  protected canWithdraw(): boolean {
    const w = this.wallet();
    return (
      !!w &&
      !w.suspended &&
      (w.withdrawable?.minorUnits ?? 0) >= (w.minWithdrawal?.minorUnits ?? 0) &&
      (w.minWithdrawal?.minorUnits ?? 0) > 0
    );
  }
}
