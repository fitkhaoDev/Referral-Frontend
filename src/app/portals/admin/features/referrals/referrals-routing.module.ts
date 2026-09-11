import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReferralListComponent } from './pages/referral-list/referral-list.component';

const routes: Routes = [
  { path: '', component: ReferralListComponent, title: 'Referrals · FitKhao Admin' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReferralsRoutingModule {}
