import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { money } from '@core/models/money.model';
import { WalletsModule } from '../../wallets.module';
import { WalletTransaction } from '../../models/wallet.model';
import { WalletTransactionDialogComponent } from './wallet-transaction-dialog.component';

const REVERSAL: WalletTransaction = {
  id: 'wtx-1-000005',
  reference: 'WTX-001-0005',
  type: 'REVERSAL',
  direction: 'DEBIT',
  amount: money(600),
  status: 'REVERSED',
  customerRef: 'CUS-08123',
  commissionRef: 'COM-2026-003005',
  note: 'Subscription refunded — commission clawed back',
  occurredAt: new Date('2026-08-01T12:00:00Z').toISOString(),
};

describe('WalletTransactionDialogComponent', () => {
  it('renders a reversal as a debit and explains the separate row', () => {
    TestBed.configureTestingModule({
      imports: [
        WalletsModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
      ],
      providers: [
        { provide: DIALOG_DATA, useValue: { transaction: REVERSAL } },
        { provide: DialogRef, useValue: { close: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(WalletTransactionDialogComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('Commission reversal');
    expect(text).toContain('−₹600');
    expect(text).toContain('COM-2026-003005');
    expect(text).toContain('retained unchanged for audit');
  });
});
