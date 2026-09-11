import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsOverviewComponent } from './pages/analytics-overview/analytics-overview.component';

const routes: Routes = [
  { path: '', component: AnalyticsOverviewComponent, title: 'Analytics · FitKhao Admin' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalyticsRoutingModule {}
