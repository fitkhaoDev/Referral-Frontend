import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  effect,
  input,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Validators } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { INCENTIVE_COMPONENT_KIND_LABEL } from '../../models/incentive-rule.model';
import { IncentiveComponentGroup } from '../incentive-form.util';

/**
 * Editor for one incentive value: kind (None / Percentage / Fixed) with the matching
 * value input. Manages its own conditional validators on the passed group.
 */
@Component({
  selector: 'app-incentive-component-field',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incentive-component-field.component.html',
  styleUrl: './incentive-component-field.component.css',
})
export class IncentiveComponentFieldComponent {
  readonly group = input.required<IncentiveComponentGroup>();
  readonly label = input('Incentive');
  readonly hint = input('');
  /** Compact layout for use inside a renewal tier row. */
  readonly compact = input(false, { transform: booleanAttribute });

  protected readonly kindOptions: SelectOption[] = (['NONE', 'PERCENT', 'FIXED'] as const).map(
    (k) => ({ value: k, label: INCENTIVE_COMPONENT_KIND_LABEL[k] }),
  );

  protected readonly kind = toSignal(
    toObservable(this.group).pipe(
      switchMap((g) => g.controls.kind.valueChanges.pipe(startWith(g.controls.kind.value))),
    ),
    { initialValue: 'NONE' as const },
  );

  constructor() {
    effect(() => {
      const g = this.group();
      const percent = g.controls.percent;
      const amount = g.controls.amount;
      percent.clearValidators();
      amount.clearValidators();
      if (this.kind() === 'PERCENT') {
        percent.addValidators([Validators.required, Validators.min(0.01), Validators.max(100)]);
      } else if (this.kind() === 'FIXED') {
        amount.addValidators([Validators.required, Validators.min(1)]);
      }
      percent.updateValueAndValidity({ emitEvent: false });
      amount.updateValueAndValidity({ emitEvent: false });
    });
  }
}
