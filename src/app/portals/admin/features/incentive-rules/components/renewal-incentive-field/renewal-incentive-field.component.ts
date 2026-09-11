import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { RENEWAL_INCENTIVE_KIND_LABEL } from '../../models/incentive-rule.model';
import { makeIncentiveComponentGroup, RenewalGroup } from '../incentive-form.util';

/**
 * Editor for the renewal incentive structure: none · same % · same fixed · a
 * distinct incentive per renewal number (dynamic tier rows) + a "beyond last tier"
 * incentive. Manages its own conditional validators.
 */
@Component({
  selector: 'app-renewal-incentive-field',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './renewal-incentive-field.component.html',
  styleUrl: './renewal-incentive-field.component.css',
})
export class RenewalIncentiveFieldComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly group = input.required<RenewalGroup>();

  protected readonly kindOptions: SelectOption[] = (
    ['NONE', 'PERCENT_INDEFINITE', 'FIXED_INDEFINITE', 'PER_RENEWAL'] as const
  ).map((k) => ({ value: k, label: RENEWAL_INCENTIVE_KIND_LABEL[k] }));

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
      if (this.kind() === 'PERCENT_INDEFINITE') {
        percent.addValidators([Validators.required, Validators.min(0.01), Validators.max(100)]);
      } else if (this.kind() === 'FIXED_INDEFINITE') {
        amount.addValidators([Validators.required, Validators.min(1)]);
      }
      percent.updateValueAndValidity({ emitEvent: false });
      amount.updateValueAndValidity({ emitEvent: false });
    });
  }

  protected addTier(): void {
    this.group().controls.tiers.push(
      makeIncentiveComponentGroup(this.fb, { kind: 'PERCENT', percent: 1 }),
    );
  }

  protected removeTier(index: number): void {
    const tiers = this.group().controls.tiers;
    if (tiers.length > 1) tiers.removeAt(index);
  }
}
