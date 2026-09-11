import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { money } from '@core/models/money.model';
import { CommissionsModule } from '../../commissions.module';
import { Commission } from '../../models/commission.model';
import { CommissionDetailDialogComponent } from './commission-detail-dialog.component';

const REVERSED: Commission = {
  id: 'commission-000006',
  reference: 'COM-2026-003005',
  beneficiaryType: 'DOCTOR',
  organisationId: 'org-000001',
  organisationName: 'Apollo Hospital — Dum Dum',
  memberId: 'omember-000001',
  memberName: 'Dr. John Doe',
  customerRef: 'CUS-08123',
  referralCode: 'APOLLO-DUMDUM',
  eventCode: 'SUBSCRIPTION_PURCHASED',
  eventName: 'Subscription Purchased',
  calculatedAmount: money(600),
  status: 'REVERSED',
  ruleSnapshot: {
    ruleId: 'irule-000006',
    ruleVersion: 1,
    incentiveType: 'FIRST_PURCHASE',
    componentKind: 'PERCENT',
    percent: 5,
    eligibleAmount: money(12000),
    snapshotAt: new Date('2026-07-01T06:00:00Z').toISOString(),
  },
  transactionRef: 'TXN-00600054',
  occurredAt: new Date('2026-07-01T10:00:00Z').toISOString(),
  availableAt: new Date('2026-07-03T10:00:00Z').toISOString(),
  reversedAt: new Date('2026-08-01T12:00:00Z').toISOString(),
  reversalReason: 'Subscription refunded',
};

describe('CommissionDetailDialogComponent', () => {
  it('shows the rule snapshot verbatim and the reversal note', () => {
    TestBed.configureTestingModule({
      imports: [
        CommissionsModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
      ],
      providers: [
        { provide: DIALOG_DATA, useValue: { commission: REVERSED } },
        { provide: DialogRef, useValue: { close: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(CommissionDetailDialogComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('irule-000006 · v1');
    expect(text).toContain('First purchase');
    expect(text).toContain('5%');
    expect(text).toContain('Subscription refunded');
    expect(text).toContain('never rewrites this');
  });
});
