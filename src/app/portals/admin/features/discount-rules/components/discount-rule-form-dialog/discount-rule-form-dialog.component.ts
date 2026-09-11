import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EntityStatus } from '@core/models/common.model';
import { money, toMajorUnits } from '@core/models/money.model';
import { RuleScopeType } from '@core/models/rule-scope.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { RuleScopeOptionsService } from '../../../../shared/rule-scope-options.service';
import {
  CreateDiscountRulePayload,
  DiscountKind,
  DiscountValue,
} from '../../models/discount-rule.model';
import { DiscountRuleActions } from '../../store/discount-rules.actions';
import {
  selectDiscountRulesCrudError,
  selectDiscountRulesSaving,
} from '../../store/discount-rules.crud.reducer';
import { DiscountRuleFormDialogData } from './discount-rule-form-dialog.model';

@Component({
  selector: 'app-discount-rule-form-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './discount-rule-form-dialog.component.html',
  styleUrl: './discount-rule-form-dialog.component.css',
})
export class DiscountRuleFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly scopeOptions = inject(RuleScopeOptionsService);
  protected readonly data = inject<DiscountRuleFormDialogData>(DIALOG_DATA);

  protected readonly isEdit = this.data.mode === 'edit';
  protected readonly editing = this.data.mode === 'edit' ? this.data.rule : null;
  protected readonly saving = this.store.selectSignal(selectDiscountRulesSaving);
  private readonly crudError = this.store.selectSignal(selectDiscountRulesCrudError);

  protected readonly scopeTypeOptions: SelectOption[] = [
    { value: 'GLOBAL', label: 'All partners' },
    { value: 'PARTNER_TYPE', label: 'A partner type' },
    { value: 'ORGANISATION_TYPE', label: 'An organisation type' },
    { value: 'ORGANISATION', label: 'A specific organisation' },
  ];
  protected readonly kindOptions: SelectOption[] = [
    { value: 'NONE', label: 'No discount' },
    { value: 'PERCENT', label: 'Percentage' },
    { value: 'FIXED', label: 'Fixed amount (₹)' },
  ];

  private readonly partnerTypeOpts = toSignal(this.scopeOptions.partnerTypeOptions$, {
    initialValue: [] as SelectOption[],
  });
  private readonly organisationTypeOpts = toSignal(this.scopeOptions.organisationTypeOptions$, {
    initialValue: [] as SelectOption[],
  });
  private readonly organisationOpts = toSignal(this.scopeOptions.organisationOptions$, {
    initialValue: [] as SelectOption[],
  });

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    scopeType: ['GLOBAL' as RuleScopeType, [Validators.required]],
    scopeId: [''],
    kind: ['PERCENT' as DiscountKind, [Validators.required]],
    percent: [10],
    maxAmount: [''],
    amount: [''],
    active: [true],
    effectiveFrom: [new Date().toISOString().slice(0, 10), [Validators.required]],
  });

  protected readonly scopeType = toSignal(this.form.controls.scopeType.valueChanges, {
    initialValue: this.form.controls.scopeType.value,
  });
  protected readonly kind = toSignal(this.form.controls.kind.valueChanges, {
    initialValue: this.form.controls.kind.value,
  });

  protected readonly scopeIdOptions = computed<SelectOption[]>(() => {
    switch (this.scopeType()) {
      case 'PARTNER_TYPE':
        return this.partnerTypeOpts();
      case 'ORGANISATION_TYPE':
        return this.organisationTypeOpts();
      case 'ORGANISATION':
        return this.organisationOpts();
      default:
        return [];
    }
  });

  constructor() {
    if (this.data.mode === 'edit') {
      const r = this.data.rule;
      this.form.reset({
        name: r.name,
        scopeType: r.scopeType,
        scopeId: r.scopeId ?? '',
        kind: r.discount.kind,
        percent: r.discount.percent ?? 10,
        maxAmount: r.discount.maxAmount ? String(toMajorUnits(r.discount.maxAmount)) : '',
        amount: r.discount.amount ? String(toMajorUnits(r.discount.amount)) : '',
        active: r.status === 'ACTIVE',
        effectiveFrom: r.effectiveFrom,
      });
    }

    // Toggle scopeId requirement.
    effect(() => {
      const needsScope = this.scopeType() !== 'GLOBAL';
      const control = this.form.controls.scopeId;
      if (needsScope) control.addValidators(Validators.required);
      else {
        control.clearValidators();
        control.setValue('', { emitEvent: false });
      }
      control.updateValueAndValidity({ emitEvent: false });
    });

    // Toggle discount value requirements.
    effect(() => {
      const kind = this.kind();
      const percent = this.form.controls.percent;
      const amount = this.form.controls.amount;
      percent.clearValidators();
      amount.clearValidators();
      if (kind === 'PERCENT') {
        percent.addValidators([Validators.required, Validators.min(0.01), Validators.max(100)]);
      } else if (kind === 'FIXED') {
        amount.addValidators([Validators.required, Validators.min(1)]);
      }
      percent.updateValueAndValidity({ emitEvent: false });
      amount.updateValueAndValidity({ emitEvent: false });
    });

    effect(() => {
      const err = this.crudError();
      const nameErr = err?.fieldErrors?.['name']?.[0];
      if (nameErr) this.form.controls.name.setErrors({ server: nameErr });
    });

    this.actions$
      .pipe(
        ofType(DiscountRuleActions.createSuccess, DiscountRuleActions.updateSuccess),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.dialogRef.close(true));
  }

  protected genericError(): string | null {
    const err = this.crudError();
    if (!err || err.status === 422) return null;
    return err.message;
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  private buildDiscount(): DiscountValue {
    const raw = this.form.getRawValue();
    if (raw.kind === 'NONE') return { kind: 'NONE' };
    if (raw.kind === 'FIXED') return { kind: 'FIXED', amount: money(Number(raw.amount)) };
    return {
      kind: 'PERCENT',
      percent: Number(raw.percent),
      maxAmount: raw.maxAmount ? money(Number(raw.maxAmount)) : undefined,
    };
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: CreateDiscountRulePayload = {
      name: raw.name.trim(),
      scopeType: raw.scopeType,
      scopeId: raw.scopeType === 'GLOBAL' ? undefined : raw.scopeId,
      discount: this.buildDiscount(),
      status: (raw.active ? 'ACTIVE' : 'INACTIVE') as EntityStatus,
      effectiveFrom: raw.effectiveFrom,
    };

    if (this.data.mode === 'edit') {
      this.store.dispatch(DiscountRuleActions.update({ id: this.data.rule.id, payload }));
    } else {
      this.store.dispatch(DiscountRuleActions.create({ payload }));
    }
  }
}
