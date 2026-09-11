import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Temporary stand-in for feature screens not yet implemented. Wired into the route
 * tree now so navigation, lazy loading and guards are exercised end-to-end; each is
 * replaced by its real feature component in a later increment.
 */
@Component({
  selector: 'app-placeholder',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './placeholder.component.html',
  styleUrl: './placeholder.component.css',
})
export class PlaceholderComponent {
  /** Bound from the route's `data.label`. */
  readonly label = input('Screen');
}
