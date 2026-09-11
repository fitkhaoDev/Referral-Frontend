import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/**
 * FitKhao brand mark. Renders the supplied app logo (`public/logo_app.png`).
 * `size` sets the square px dimension; `showWordmark` appends the "FitKhao" wordmark
 * for use on light surfaces (topbars, cards).
 *
 * NOTE: `logo_app.png` is a 1024×1024 ~1.2 MB source asset. For production, add a
 * downscaled `webp` (or SVG) version and repoint `src`.
 */
@Component({
  selector: 'app-logo',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.css',
})
export class LogoComponent {
  readonly size = input(40);
  readonly showWordmark = input(true, { transform: booleanAttribute });
}
