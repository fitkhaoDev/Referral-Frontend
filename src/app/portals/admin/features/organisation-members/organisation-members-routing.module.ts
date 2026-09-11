import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganisationMemberListComponent } from './pages/organisation-member-list/organisation-member-list.component';

const routes: Routes = [
  {
    path: '',
    component: OrganisationMemberListComponent,
    title: 'Organisation members · FitKhao Admin',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganisationMembersRoutingModule {}
