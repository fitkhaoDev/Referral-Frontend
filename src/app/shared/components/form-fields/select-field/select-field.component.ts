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

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

let uid = 0;

/** Labelled native `<select>` bound to a reactive `FormControl`, matching the text field. */
@Component({
  selector: 'app-select-field',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-field.component.html',
  styleUrl: './select-field.component.css',
})
export class SelectFieldComponent {
  readonly control = input.required<FormControl>();
  readonly label = input.required<string>();
  readonly options = input.required<readonly SelectOption[]>();
  readonly placeholder = input('');
  readonly hint = input('');
  readonly requiredMark = input(false, { transform: booleanAttribute });
  readonly errors = input<Record<string, string>>({});

  protected readonly id = `app-select-${++uid}`;

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
