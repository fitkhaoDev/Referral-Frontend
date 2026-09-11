import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminAuthGuard } from '@core/auth/guards/admin-auth.guard';
import { AdminGuestGuard } from '@core/auth/guards/admin-guest.guard';
import { AdminPermissionGuard } from '@core/auth/guards/admin-permission.guard';
import { ForbiddenComponent } from '@shared/pages/forbidden/forbidden.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminShellComponent } from './shell/admin-shell/admin-shell.component';

/** A permission-guarded, lazy-loaded feature module route. */
function feature(path: string, permission: string, load: Routes[number]['loadChildren']): Routes[number] {
  return { path, canActivate: [AdminPermissionGuard], data: { permissions: [permission] }, loadChildren: load };
}

const routes: Routes = [
  {
    path: 'login',
    component: AdminLoginComponent,
    canActivate: [AdminGuestGuard],
    title: 'Admin sign in · FitKhao',
  },
  {
    path: '',
    component: AdminShellComponent,
    canActivate: [AdminAuthGuard],
    canActivateChild: [AdminAuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · FitKhao Admin',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      feature('partners', 'partner:read', () =>
        import('./features/partners/partners.module').then((m) => m.PartnersModule),
      ),
      feature('partner-types', 'partner-type:manage', () =>
        import('./features/partner-types/partner-types.module').then((m) => m.PartnerTypesModule),
      ),
      feature('organisations', 'organisation:manage', () =>
        import('./features/organisations/organisations.module').then((m) => m.OrganisationsModule),
      ),
      feature('organisation-types', 'organisation-type:manage', () =>
        import('./features/organisation-types/organisation-types.module').then(
          (m) => m.OrganisationTypesModule,
        ),
      ),
      feature('organisation-members', 'organisation-member:manage', () =>
        import('./features/organisation-members/organisation-members.module').then(
          (m) => m.OrganisationMembersModule,
        ),
      ),
      feature('referrals', 'referral:read', () =>
        import('./features/referrals/referrals.module').then((m) => m.ReferralsModule),
      ),
      feature('referral-events', 'referral-event:manage', () =>
        import('./features/referral-events/referral-events.module').then(
          (m) => m.ReferralEventsModule,
        ),
      ),
      feature('incentive-rules', 'incentive-rule:manage', () =>
        import('./features/incentive-rules/incentive-rules.module').then(
          (m) => m.IncentiveRulesModule,
        ),
      ),
      feature('discount-rules', 'discount-rule:manage', () =>
        import('./features/discount-rules/discount-rules.module').then((m) => m.DiscountRulesModule),
      ),
      feature('commissions', 'commission:read', () =>
        import('./features/commissions/commissions.module').then((m) => m.CommissionsModule),
      ),
      feature('wallet', 'wallet:read', () =>
        import('./features/wallets/wallets.module').then((m) => m.WalletsModule),
      ),
      feature('withdrawals', 'withdrawal:read', () =>
        import('./features/withdrawals/withdrawals.module').then((m) => m.WithdrawalsModule),
      ),
      feature('analytics', 'analytics:read', () =>
        import('./features/analytics/analytics.module').then((m) => m.AnalyticsModule),
      ),
      {
        path: 'profile',
        title: 'Profile · FitKhao Admin',
        loadChildren: () =>
          import('./features/admin-profile/admin-profile.module').then((m) => m.AdminProfileModule),
      },
      { path: 'forbidden', component: ForbiddenComponent, data: { home: '/admin' } },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
