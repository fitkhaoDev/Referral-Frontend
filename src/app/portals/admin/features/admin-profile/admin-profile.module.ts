import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { AdminProfileRoutingModule } from './admin-profile-routing.module';
import { AdminProfileComponent } from './pages/admin-profile/admin-profile.component';

/** Admin → Profile (own account + change password). Lazy-loaded. */
@NgModule({
  imports: [SharedModule, AdminProfileRoutingModule],
  declarations: [AdminProfileComponent],
})
export class AdminProfileModule {}
