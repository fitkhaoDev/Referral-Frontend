import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommissionListComponent } from './pages/commission-list/commission-list.component';

const routes: Routes = [
  { path: '', component: CommissionListComponent, title: 'Commissions · FitKhao Admin' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommissionsRoutingModule {}
