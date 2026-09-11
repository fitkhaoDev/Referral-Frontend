import { FormArray, FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { money, toMajorUnits } from '@core/models/money.model';
import {
  IncentiveComponent,
  IncentiveComponentKind,
  RenewalIncentive,
  RenewalIncentiveKind,
} from '../models/incentive-rule.model';

/** Reactive group for one {@link IncentiveComponent} (kind + percent + rupee amount as string). */
export type IncentiveComponentGroup = FormGroup<{
  kind: FormControl<IncentiveComponentKind>;
  percent: FormControl<number>;
  amount: FormControl<string>;
}>;

export type RenewalGroup = FormGroup<{
  kind: FormControl<RenewalIncentiveKind>;
  percent: FormControl<number>;
  amount: FormControl<string>;
  tiers: FormArray<IncentiveComponentGroup>;
  beyondLastTier: IncentiveComponentGroup;
}>;

export function makeIncentiveComponentGroup(
  fb: NonNullableFormBuilder,
  value?: IncentiveComponent,
): IncentiveComponentGroup {
  return fb.group({
    kind: fb.control<IncentiveComponentKind>(value?.kind ?? 'NONE'),
    percent: fb.control<number>(value?.percent ?? 0),
    amount: fb.control<string>(value?.amount ? String(toMajorUnits(value.amount)) : ''),
  });
}

export function readIncentiveComponent(group: IncentiveComponentGroup): IncentiveComponent {
  const v = group.getRawValue();
  if (v.kind === 'NONE') return { kind: 'NONE' };
  if (v.kind === 'FIXED') return { kind: 'FIXED', amount: money(Number(v.amount)) };
  return { kind: 'PERCENT', percent: Number(v.percent) };
}

export function makeRenewalGroup(fb: NonNullableFormBuilder, value?: RenewalIncentive): RenewalGroup {
  const tiers = fb.array<IncentiveComponentGroup>(
    (value?.kind === 'PER_RENEWAL' ? (value.tiers ?? []) : []).map((t) =>
      makeIncentiveComponentGroup(fb, t.incentive),
    ),
  );
  if (tiers.length === 0) {
    tiers.push(makeIncentiveComponentGroup(fb, { kind: 'PERCENT', percent: 3 }));
  }
  return fb.group({
    kind: fb.control<RenewalIncentiveKind>(value?.kind ?? 'NONE'),
    percent: fb.control<number>(value?.percent ?? 0),
    amount: fb.control<string>(value?.amount ? String(toMajorUnits(value.amount)) : ''),
    tiers,
    beyondLastTier: makeIncentiveComponentGroup(
      fb,
      value?.kind === 'PER_RENEWAL' ? value.beyondLastTier : { kind: 'NONE' },
    ),
  });
}

export function readRenewalIncentive(group: RenewalGroup): RenewalIncentive {
  const kind = group.controls.kind.value;
  if (kind === 'NONE') return { kind: 'NONE' };
  if (kind === 'PERCENT_INDEFINITE') {
    return { kind, percent: Number(group.controls.percent.value) };
  }
  if (kind === 'FIXED_INDEFINITE') {
    return { kind, amount: money(Number(group.controls.amount.value)) };
  }
  return {
    kind: 'PER_RENEWAL',
    tiers: group.controls.tiers.controls.map((g, i) => ({
      renewalNumber: i + 1,
      incentive: readIncentiveComponent(g),
    })),
    beyondLastTier: readIncentiveComponent(group.controls.beyondLastTier),
  };
}
