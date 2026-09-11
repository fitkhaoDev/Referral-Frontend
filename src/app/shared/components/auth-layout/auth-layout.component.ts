import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Split-screen authentication layout: brand panel (hidden on small screens) beside a
 * centered form card. Purely presentational — portals project their own form.
 */
@Component({
  selector: 'app-auth-layout',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
})
export class AuthLayoutComponent {
  readonly eyebrow = input('');
  readonly heading = input('Sign in');
  readonly subheading = input('');
  readonly tagline = input('Referral Partner Management');
}
