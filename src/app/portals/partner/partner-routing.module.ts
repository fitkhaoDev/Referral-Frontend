import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartnerAuthGuard } from '@core/auth/guards/partner-auth.guard';
import { PartnerGuestGuard } from '@core/auth/guards/partner-guest.guard';
import { PartnerPasswordChangeGuard } from '@core/auth/guards/partner-password-change.guard';
import { PlaceholderComponent } from '@shared/pages/placeholder/placeholder.component';
import { PartnerChangePasswordComponent } from './pages/partner-change-password/partner-change-password.component';
import { PartnerDashboardComponent } from './pages/partner-dashboard/partner-dashboard.component';
import { PartnerLoginComponent } from './pages/partner-login/partner-login.component';
import { PartnerShellComponent } from './shell/partner-shell/partner-shell.component';

function stub(path: string, label: string): Routes[number] {
  return {
    path,
    component: PlaceholderComponent,
    title: `${label} · FitKhao Partners`,
    data: { label },
  };
}

/**
 * Partner portal routes (lazy-loaded as a unit).
 *
 * - `login` is public.
 * - `change-password` requires auth only, so it is reachable both for the FORCED
 *   first-login change and for voluntary changes.
 * - The main shell additionally applies {@link PartnerPasswordChangeGuard}: while
 *   `mustChangePassword` is true, every section redirects to `change-password`, so a
 *   partner cannot reach the dashboard by typing the URL. The backend enforces the
 *   same rule on every protected call.
 */
const routes: Routes = [
  {
    path: 'login',
    component: PartnerLoginComponent,
    canActivate: [PartnerGuestGuard],
    title: 'Partner sign in · FitKhao',
  },
  {
    path: 'change-password',
    component: PartnerChangePasswordComponent,
    canActivate: [PartnerAuthGuard],
    title: 'Change password · FitKhao Partners',
  },
  {
    path: '',
    component: PartnerShellComponent,
    canActivate: [PartnerAuthGuard, PartnerPasswordChangeGuard],
    canActivateChild: [PartnerAuthGuard, PartnerPasswordChangeGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        component: PartnerDashboardComponent,
        title: 'Dashboard · FitKhao Partners',
      },
      stub('referrals', 'Referrals'),
      stub('wallet', 'Wallet'),
      stub('withdrawals', 'Withdrawals'),
      stub('profile', 'Profile'),
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartnerRoutingModule {}
