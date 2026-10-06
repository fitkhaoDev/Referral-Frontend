import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { PartnerReferralsPageComponent } from './pages/partner-referrals-page/partner-referrals-page.component';

const routes: Route[] = [
  { path: '', component: PartnerReferralsPageComponent, title: 'Referrals · FitKhao Partners' },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [PartnerReferralsPageComponent],
})
export class PartnerReferralsModule {}
