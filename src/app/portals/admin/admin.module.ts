import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminShellComponent } from './shell/admin-shell/admin-shell.component';

/** Admin portal — lazy-loaded as a unit from the root router. */
@NgModule({
  imports: [SharedModule, AdminRoutingModule],
  declarations: [AdminShellComponent, AdminLoginComponent],
})
export class AdminModule {}
