import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartnerTypeListComponent } from './pages/partner-type-list/partner-type-list.component';

const routes: Routes = [
  { path: '', component: PartnerTypeListComponent, title: 'Partner types · FitKhao Admin' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartnerTypesRoutingModule {}
