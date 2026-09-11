import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminProfileComponent } from './pages/admin-profile/admin-profile.component';

const routes: Routes = [
  { path: '', component: AdminProfileComponent, title: 'Profile · FitKhao Admin' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminProfileRoutingModule {}
