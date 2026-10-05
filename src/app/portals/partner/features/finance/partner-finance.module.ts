import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { BankAccountFormDialogComponent } from './components/bank-account-form-dialog/bank-account-form-dialog.component';
import { WithdrawDialogComponent } from './components/withdraw-dialog/withdraw-dialog.component';
import { PartnerProfilePageComponent } from './pages/partner-profile-page/partner-profile-page.component';
import { PartnerWalletPageComponent } from './pages/partner-wallet-page/partner-wallet-page.component';
import { PartnerWithdrawalsPageComponent } from './pages/partner-withdrawals-page/partner-withdrawals-page.component';

const routes: Route[] = [
  { path: 'wallet', component: PartnerWalletPageComponent, title: 'Wallet · FitKhao Partners' },
  {
    path: 'withdrawals',
    component: PartnerWithdrawalsPageComponent,
    title: 'Withdrawals · FitKhao Partners',
  },
  { path: 'profile', component: PartnerProfilePageComponent, title: 'Profile · FitKhao Partners' },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [
    PartnerWalletPageComponent,
    PartnerWithdrawalsPageComponent,
    PartnerProfilePageComponent,
    BankAccountFormDialogComponent,
    WithdrawDialogComponent,
  ],
})
export class PartnerFinanceModule {}
