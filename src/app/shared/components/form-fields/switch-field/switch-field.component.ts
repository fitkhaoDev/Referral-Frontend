import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';

let uid = 0;

/**
 * Accessible on/off switch bound to a boolean reactive `FormControl`. Rendered as a
 * native checkbox styled as a toggle, with an on/off text state so it is not
 * colour-only.
 */
@Component({
  selector: 'app-switch-field',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './switch-field.component.html',
  styleUrl: './switch-field.component.css',
})
export class SwitchFieldComponent {
  readonly control = input.required<FormControl>();
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly onText = input('On');
  readonly offText = input('Off');

  protected readonly id = `app-switch-${++uid}`;
  protected readonly checked = toSignal(
    toObservable(this.control).pipe(switchMap((c) => c.valueChanges.pipe(startWith(c.value)))),
    { initialValue: false },
  );
}
