import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganisationCreateComponent } from './pages/organisation-create/organisation-create.component';
import { OrganisationDetailComponent } from './pages/organisation-detail/organisation-detail.component';
import { OrganisationListComponent } from './pages/organisation-list/organisation-list.component';

const routes: Routes = [
  { path: '', component: OrganisationListComponent, title: 'Organisations · FitKhao Admin' },
  {
    path: 'new',
    component: OrganisationCreateComponent,
    title: 'Enrol organisation · FitKhao Admin',
  },
  { path: ':id', component: OrganisationDetailComponent, title: 'Organisation · FitKhao Admin' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganisationsRoutingModule {}
