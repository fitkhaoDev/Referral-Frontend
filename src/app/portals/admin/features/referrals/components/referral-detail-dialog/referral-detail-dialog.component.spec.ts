import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { money } from '@core/models/money.model';
import { ReferralsModule } from '../../referrals.module';
import { Referral } from '../../models/referral.model';
import { ReferralDetailDialogComponent } from './referral-detail-dialog.component';

const ORG_REFERRAL: Referral = {
  id: 'referral-000001',
  reference: 'REF-2026-004000',
  customerRef: 'CUS-08000',
  partnerCategory: 'ORGANISATION',
  organisationId: 'org-000001',
  organisationName: 'Apollo Hospital — Dum Dum',
  referringMemberId: 'omember-000001',
  referringMemberName: 'Dr. John Doe',
  referralCode: 'APOLLO-DUMDUM',
  eventCode: 'SUBSCRIPTION_PURCHASED',
  eventName: 'Subscription Purchased',
  plan: 'Annual Wellness',
  planAmount: money(12000),
  customerDiscount: money(1200),
  amountPayable: money(10800),
  commissionAmount: money(600),
  commissionStatus: 'AVAILABLE',
  occurredAt: new Date('2026-09-01T10:00:00Z').toISOString(),
  transactionRef: 'TXN-00500000',
};

describe('ReferralDetailDialogComponent', () => {
  it('renders the organisation attribution chain, amounts and commission status', () => {
    TestBed.configureTestingModule({
      imports: [
        ReferralsModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
      ],
      providers: [
        { provide: DIALOG_DATA, useValue: { referral: ORG_REFERRAL } },
        { provide: DialogRef, useValue: { close: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(ReferralDetailDialogComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('Apollo Hospital — Dum Dum');
    expect(text).toContain('Dr. John Doe');
    expect(text).toContain('APOLLO-DUMDUM');
    expect(text).toContain('Available');
    expect(text).toContain('600');
  });
});
