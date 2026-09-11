import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';

let uid = 0;

/**
 * Labelled native date input bound to a reactive `FormControl` (ISO `yyyy-mm-dd`
 * string). Matches {@link TextFieldComponent}'s styling and validation display.
 */
@Component({
  selector: 'app-date-field',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-field.component.html',
  styleUrls: ['../text-field/text-field.component.css'],
})
export class DateFieldComponent {
  readonly control = input.required<FormControl>();
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly min = input<string>('');
  readonly max = input<string>('');
  readonly requiredMark = input(false, { transform: booleanAttribute });
  readonly errors = input<Record<string, string>>({});

  protected readonly id = `app-date-${++uid}`;

  private readonly controlEvents = toSignal(
    toObservable(this.control).pipe(switchMap((c) => c.events.pipe(startWith(null)))),
    { initialValue: null },
  );

  protected readonly showError = computed(() => {
    this.controlEvents();
    const c = this.control();
    return c.invalid && (c.touched || c.dirty);
  });

  protected readonly errorText = computed(() => {
    this.controlEvents();
    const c = this.control();
    if (!c.errors) return '';
    if (c.errors['server']) return String(c.errors['server']);
    const map: Record<string, string> = {
      required: `${this.label()} is required.`,
      dateRange: 'The “from” date must be on or before the “to” date.',
      ...this.errors(),
    };
    const key = Object.keys(c.errors).find((k) => map[k]);
    return key ? map[key] : `${this.label()} is invalid.`;
  });

  protected readonly describedBy = computed(() => {
    if (this.showError()) return `${this.id}-error`;
    if (this.hint()) return `${this.id}-hint`;
    return null;
  });
}
