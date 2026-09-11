import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthFacadeService } from '@core/auth/services/auth-facade.service';
import { LoadingService } from '@core/http/services/loading.service';
import { PARTNER_NAV } from '../partner-nav';

@Component({
  selector: 'app-partner-shell',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-shell.component.html',
  styleUrl: './partner-shell.component.css',
})
export class PartnerShellComponent {
  private readonly auth = inject(AuthFacadeService);
  protected readonly loading = inject(LoadingService);

  protected readonly nav = PARTNER_NAV;
  protected readonly user = this.auth.user('partner');
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  protected signOut(): void {
    this.menuOpen.set(false);
    this.auth.logout('partner');
  }
}
