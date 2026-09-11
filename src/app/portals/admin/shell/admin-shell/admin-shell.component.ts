import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthFacadeService } from '@core/auth/services/auth-facade.service';
import { LoadingService } from '@core/http/services/loading.service';
import { ADMIN_NAV, NavGroup } from '../admin-nav';

@Component({
  selector: 'app-admin-shell',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.css',
})
export class AdminShellComponent {
  private readonly auth = inject(AuthFacadeService);
  protected readonly loading = inject(LoadingService);

  protected readonly user = this.auth.user('admin');
  private readonly permissions = this.auth.permissions('admin');

  protected readonly navOpen = signal(false);
  protected readonly userMenuOpen = signal(false);

  protected readonly groups = computed<NavGroup[]>(() => {
    const perms = this.permissions();
    return ADMIN_NAV.map((g) => ({
      heading: g.heading,
      items: g.items.filter((i) => !i.permission || perms.includes(i.permission)),
    })).filter((g) => g.items.length > 0);
  });

  protected toggleNav(): void {
    this.navOpen.update((v) => !v);
  }

  protected closeNav(): void {
    this.navOpen.set(false);
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  protected signOut(): void {
    this.userMenuOpen.set(false);
    this.auth.logout('admin');
  }
}
