import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthFacadeService } from '@core/auth/services/auth-facade.service';

@Component({
  selector: 'app-admin-profile',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css',
})
export class AdminProfileComponent {
  private readonly auth = inject(AuthFacadeService);

  protected readonly user = this.auth.user('admin');
  protected readonly permissions = this.auth.permissions('admin');

  protected signOut(): void {
    this.auth.logout('admin');
  }
}
