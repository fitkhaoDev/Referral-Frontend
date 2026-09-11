import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiscountRuleListComponent } from './pages/discount-rule-list/discount-rule-list.component';

const routes: Routes = [
  { path: '', component: DiscountRuleListComponent, title: 'Discount rules · FitKhao Admin' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiscountRulesRoutingModule {}
