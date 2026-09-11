import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { money } from '@core/models/money.model';
import { WithdrawalsModule } from '../../withdrawals.module';
import { Withdrawal, WithdrawalAction } from '../../models/withdrawal.model';
import { WithdrawalActions } from '../../store/withdrawals.actions';
import { WithdrawalActionDialogComponent } from './withdrawal-action-dialog.component';

const WITHDRAWAL: Withdrawal = {
  id: 'withdrawal-000001',
  reference: 'WDR-2026-005000',
  beneficiaryType: 'PARTNER',
  partnerId: 'partner-000001',
  partnerName: 'Dr. John Doe',
  walletId: 'wallet-000001',
  amount: money(6000),
  availableBalanceAtRequest: money(9000),
  status: 'REQUESTED',
  allowedActions: ['APPROVE', 'REJECT'],
  payoutMethod: 'BANK_TRANSFER',
  payoutDestination: 'HDFC ••••4821',
  requestedAt: new Date('2026-08-01T09:00:00Z').toISOString(),
};

function setup(action: WithdrawalAction) {
  const closeSpy = vi.fn();
  TestBed.configureTestingModule({
    imports: [
      WithdrawalsModule,
      RouterModule.forRoot([]),
      StoreModule.forRoot({}),
      EffectsModule.forRoot([]),
    ],
    providers: [
      { provide: DIALOG_DATA, useValue: { withdrawal: WITHDRAWAL, action } },
      { provide: DialogRef, useValue: { close: closeSpy } },
    ],
  });
  const store = TestBed.inject(Store);
  const fixture = TestBed.createComponent(WithdrawalActionDialogComponent);
  fixture.detectChanges();
  return { fixture, store, closeSpy };
}

describe('WithdrawalActionDialogComponent', () => {
  it('APPROVE dispatches approve with no extra input', () => {
    const { fixture, store } = setup('APPROVE');
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    (
      fixture.nativeElement.querySelectorAll('app-button button')[1] as HTMLButtonElement
    ).click();
    expect(dispatchSpy).toHaveBeenCalledWith(WithdrawalActions.approve({ id: WITHDRAWAL.id }));
  });

  it('REJECT requires a reason before dispatching', () => {
    const { fixture, store } = setup('REJECT');
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const confirmBtn = fixture.nativeElement.querySelectorAll(
      'app-button button',
    )[1] as HTMLButtonElement;

    confirmBtn.click();
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: WithdrawalActions.reject.type }),
    );

    const input = fixture.nativeElement.querySelector('app-text-field input') as HTMLInputElement;
    input.value = 'Bank name mismatch';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    confirmBtn.click();
    expect(dispatchSpy).toHaveBeenCalledWith(
      WithdrawalActions.reject({ id: WITHDRAWAL.id, reason: 'Bank name mismatch' }),
    );
  });

  it('closes when an actionSuccess lands', () => {
    const { store, closeSpy } = setup('APPROVE');
    store.dispatch(
      WithdrawalActions.actionSuccess({
        withdrawal: { ...WITHDRAWAL, status: 'APPROVED', allowedActions: ['MARK_PROCESSING'] },
        action: 'APPROVE',
      }),
    );
    expect(closeSpy).toHaveBeenCalledWith(true);
  });
});
