import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPermissionGuard } from '@core/auth/guards/admin-permission.guard';
import { WithdrawalDetailComponent } from './pages/withdrawal-detail/withdrawal-detail.component';
import { WithdrawalListComponent } from './pages/withdrawal-list/withdrawal-list.component';

const routes: Routes = [
  { path: '', component: WithdrawalListComponent, title: 'Withdrawals · FitKhao Admin' },
  {
    path: ':id',
    component: WithdrawalDetailComponent,
    title: 'Withdrawal · FitKhao Admin',
    canActivate: [AdminPermissionGuard],
    data: { permissions: ['withdrawal:manage'] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WithdrawalsRoutingModule {}
