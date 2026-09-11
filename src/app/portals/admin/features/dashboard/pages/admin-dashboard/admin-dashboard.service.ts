import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import type { Page, PageQuery } from '@core/models/api.model';
import { CommissionApi } from '../../../commissions/data-access/commission-api.abstract';
import type { Commission } from '../../../commissions/models/commission.model';
import { DiscountRuleApi } from '../../../discount-rules/data-access/discount-rule-api.abstract';
import { IncentiveRuleApi } from '../../../incentive-rules/data-access/incentive-rule-api.abstract';
import { OrganisationMemberApi } from '../../../organisation-members/data-access/organisation-member-api.abstract';
import { OrganisationTypeApi } from '../../../organisation-types/data-access/organisation-type-api.abstract';
import { OrganisationApi } from '../../../organisations/data-access/organisation-api.abstract';
import { PartnerTypeApi } from '../../../partner-types/data-access/partner-type-api.abstract';
import { PartnerApi } from '../../../partners/data-access/partner-api.abstract';
import { ReferralEventApi } from '../../../referral-events/data-access/referral-event-api.abstract';
import { ReferralApi } from '../../../referrals/data-access/referral-api.abstract';
import { WalletApi } from '../../../wallets/data-access/wallet-api.abstract';
import { WithdrawalApi } from '../../../withdrawals/data-access/withdrawal-api.abstract';
import type { Withdrawal } from '../../../withdrawals/models/withdrawal.model';
import type { DashboardCounts } from './admin-dashboard.model';

/** `size: 1` — we only want `totalItems`. */
function countQuery(filters: PageQuery['filters'] = {}): PageQuery {
  return { page: 0, size: 1, sort: [], search: '', filters };
}

/**
 * Assembles the admin dashboard from existing list endpoints. Each source is
 * independently guarded so one failed/forbidden call degrades a single tile to
 * `null` instead of failing the whole page.
 */
@Injectable()
export class AdminDashboardService {
  private readonly partners = inject(PartnerApi);
  private readonly organisations = inject(OrganisationApi);
  private readonly members = inject(OrganisationMemberApi);
  private readonly referrals = inject(ReferralApi);
  private readonly commissions = inject(CommissionApi);
  private readonly withdrawals = inject(WithdrawalApi);
  private readonly wallets = inject(WalletApi);
  private readonly partnerTypes = inject(PartnerTypeApi);
  private readonly organisationTypes = inject(OrganisationTypeApi);
  private readonly referralEvents = inject(ReferralEventApi);
  private readonly incentiveRules = inject(IncentiveRuleApi);
  private readonly discountRules = inject(DiscountRuleApi);

  private count(source: Observable<Page<unknown>>): Observable<number | null> {
    return source.pipe(
      map((page) => page.totalItems),
      catchError(() => of(null)),
    );
  }

  readonly counts$: Observable<DashboardCounts> = forkJoin({
    partnersTotal: this.count(this.partners.list(countQuery())),
    partnersActive: this.count(this.partners.list(countQuery({ status: 'ACTIVE' }))),
    organisationsTotal: this.count(this.organisations.list(countQuery())),
    organisationsActive: this.count(this.organisations.list(countQuery({ status: 'ACTIVE' }))),
    organisationMembers: this.count(this.members.list(countQuery())),
    referralsTotal: this.count(this.referrals.list(countQuery())),
    commissionsPending: this.count(this.commissions.list(countQuery({ status: 'PENDING' }))),
    commissionsAvailable: this.count(this.commissions.list(countQuery({ status: 'AVAILABLE' }))),
    commissionsReversed: this.count(this.commissions.list(countQuery({ status: 'REVERSED' }))),
    withdrawalsRequested: this.count(this.withdrawals.list(countQuery({ status: 'REQUESTED' }))),
    withdrawalsProcessing: this.count(this.withdrawals.list(countQuery({ status: 'PROCESSING' }))),
    walletsTotal: this.count(this.wallets.listWallets(countQuery())),
    partnerTypes: this.count(this.partnerTypes.list(countQuery())),
    organisationTypes: this.count(this.organisationTypes.list(countQuery())),
    referralEvents: this.count(this.referralEvents.list(countQuery())),
    incentiveRules: this.count(this.incentiveRules.list(countQuery())),
    discountRules: this.count(this.discountRules.list(countQuery())),
  });

  readonly latestCommissions$: Observable<Commission[]> = this.commissions
    .list({
      page: 0,
      size: 5,
      sort: [{ field: 'occurredAt', direction: 'desc' }],
      search: '',
      filters: {},
    })
    .pipe(
      map((page) => [...page.items]),
      catchError(() => of([] as Commission[])),
    );

  readonly withdrawalsToAction$: Observable<Withdrawal[]> = this.withdrawals
    .list({
      page: 0,
      size: 5,
      sort: [{ field: 'requestedAt', direction: 'asc' }],
      search: '',
      filters: { status: 'REQUESTED' },
    })
    .pipe(
      map((page) => [...page.items]),
      catchError(() => of([] as Withdrawal[])),
    );
}
