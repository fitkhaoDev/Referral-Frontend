import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IncentiveRuleListComponent } from './pages/incentive-rule-list/incentive-rule-list.component';

const routes: Routes = [
  { path: '', component: IncentiveRuleListComponent, title: 'Incentive rules · FitKhao Admin' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IncentiveRulesRoutingModule {}
