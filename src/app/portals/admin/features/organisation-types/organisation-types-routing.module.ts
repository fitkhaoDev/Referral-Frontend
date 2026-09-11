import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganisationTypeListComponent } from './pages/organisation-type-list/organisation-type-list.component';

const routes: Routes = [
  {
    path: '',
    component: OrganisationTypeListComponent,
    title: 'Organisation types · FitKhao Admin',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganisationTypesRoutingModule {}
