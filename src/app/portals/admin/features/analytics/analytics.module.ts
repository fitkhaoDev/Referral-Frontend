import { NgModule } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SharedModule } from '@shared/shared.module';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import { analyticsApiProvider } from './data-access/analytics-api.provider';
import { AnalyticsOverviewComponent } from './pages/analytics-overview/analytics-overview.component';

/** Admin → Analytics. Lazy-loaded. Charts via @swimlane/ngx-charts (needs root BrowserAnimationsModule). */
@NgModule({
  imports: [SharedModule, NgxChartsModule, AnalyticsRoutingModule],
  declarations: [AnalyticsOverviewComponent],
  providers: [analyticsApiProvider],
})
export class AnalyticsModule {}
