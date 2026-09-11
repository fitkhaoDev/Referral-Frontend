import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthFacadeService } from '@core/auth/services/auth-facade.service';

@Component({
  selector: 'app-partner-dashboard',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-dashboard.component.html',
  styleUrl: './partner-dashboard.component.css',
})
export class PartnerDashboardComponent {
  private readonly auth = inject(AuthFacadeService);
  protected readonly user = this.auth.user('partner');
  protected readonly skeletons = Array.from({ length: 8 });
}
