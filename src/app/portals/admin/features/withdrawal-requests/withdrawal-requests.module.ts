import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { WithdrawalRequestDetailDialogComponent } from './components/withdrawal-request-detail-dialog/withdrawal-request-detail-dialog.component';
import { WithdrawalRequestListComponent } from './pages/withdrawal-request-list/withdrawal-request-list.component';

const routes: Route[] = [
  {
    path: '',
    component: WithdrawalRequestListComponent,
    title: 'Withdrawal requests · FitKhao Admin',
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [WithdrawalRequestListComponent, WithdrawalRequestDetailDialogComponent],
})
export class WithdrawalRequestsModule {}
