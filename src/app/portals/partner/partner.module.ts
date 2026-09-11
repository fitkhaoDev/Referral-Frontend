import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { PartnerRoutingModule } from './partner-routing.module';
import { PartnerChangePasswordComponent } from './pages/partner-change-password/partner-change-password.component';
import { PartnerDashboardComponent } from './pages/partner-dashboard/partner-dashboard.component';
import { PartnerLoginComponent } from './pages/partner-login/partner-login.component';
import { PartnerShellComponent } from './shell/partner-shell/partner-shell.component';

/** Partner portal — lazy-loaded as a unit from the root router. */
@NgModule({
  imports: [SharedModule, PartnerRoutingModule],
  declarations: [
    PartnerShellComponent,
    PartnerLoginComponent,
    PartnerChangePasswordComponent,
    PartnerDashboardComponent,
  ],
})
export class PartnerModule {}
