import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';

let uid = 0;

/**
 * Labelled text input bound to a reactive `FormControl`. Renders hint + validation
 * message, wires `aria-describedby` / `aria-invalid`, and offers a show/hide toggle
 * for password fields. Server-side field errors surface via `{ server: 'message' }`
 * on the control.
 */
@Component({
  selector: 'app-text-field',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './text-field.component.html',
  styleUrl: './text-field.component.css',
})
export class TextFieldComponent {
  readonly control = input.required<FormControl>();
  readonly label = input.required<string>();
  readonly type = input<'text' | 'email' | 'password' | 'tel' | 'number'>('text');
  readonly autocomplete = input('off');
  readonly inputmode = input<string>('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly requiredMark = input(false, { transform: booleanAttribute });
  /** Map of validator key → message, checked in order. */
  readonly errors = input<Record<string, string>>({});

  protected readonly id = `app-field-${++uid}`;
  protected readonly reveal = signal(false);

  /** Recomputes derived state whenever the bound control's value/status/touched changes. */
  private readonly controlEvents = toSignal(
    toObservable(this.control).pipe(switchMap((c) => c.events.pipe(startWith(null)))),
    { initialValue: null },
  );

  protected readonly effectiveType = computed(() =>
    this.type() === 'password' ? (this.reveal() ? 'text' : 'password') : this.type(),
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
      email: 'Enter a valid email address.',
      minlength: `${this.label()} is too short.`,
      maxlength: `${this.label()} is too long.`,
      pattern: `${this.label()} format is invalid.`,
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

  protected toggleReveal(): void {
    this.reveal.update((v) => !v);
  }
}
