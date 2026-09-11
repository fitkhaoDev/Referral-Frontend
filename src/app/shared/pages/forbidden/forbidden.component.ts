import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-forbidden',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.css',
})
export class ForbiddenComponent {
  /** Bound from the route's `data.home`. */
  readonly home = input<string>('/');
}
