import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPermissionGuard } from '@core/auth/guards/admin-permission.guard';
import { PartnerCreateComponent } from './pages/partner-create/partner-create.component';
import { PartnerDetailComponent } from './pages/partner-detail/partner-detail.component';
import { PartnerListComponent } from './pages/partner-list/partner-list.component';

const routes: Routes = [
  { path: '', component: PartnerListComponent, title: 'Partners · FitKhao Admin' },
  {
    path: 'new',
    component: PartnerCreateComponent,
    title: 'Enrol partner · FitKhao Admin',
    canActivate: [AdminPermissionGuard],
    data: { permissions: ['partner:write'] },
  },
  { path: ':id', component: PartnerDetailComponent, title: 'Partner · FitKhao Admin' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartnersRoutingModule {}
