import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReferralEventListComponent } from './pages/referral-event-list/referral-event-list.component';

const routes: Routes = [
  { path: '', component: ReferralEventListComponent, title: 'Referral events · FitKhao Admin' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReferralEventsRoutingModule {}
