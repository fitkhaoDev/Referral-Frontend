import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EntityStatus } from '@core/models/common.model';
import { RuleScopeType } from '@core/models/rule-scope.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { RuleScopeOptionsService } from '../../../../shared/rule-scope-options.service';
import {
  CreateIncentiveRulePayload,
  INCENTIVE_BENEFICIARY_LABEL,
  IncentiveBeneficiary,
  IncentiveRule,
} from '../../models/incentive-rule.model';
import { IncentiveRuleActions } from '../../store/incentive-rules.actions';
import {
  selectIncentiveRulesCrudError,
  selectIncentiveRulesSaving,
} from '../../store/incentive-rules.crud.reducer';
import {
  makeIncentiveComponentGroup,
  makeRenewalGroup,
  readIncentiveComponent,
  readRenewalIncentive,
} from '../incentive-form.util';
import { IncentiveRuleFormDialogData } from './incentive-rule-form-dialog.model';

@Component({
  selector: 'app-incentive-rule-form-dialog',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incentive-rule-form-dialog.component.html',
  styleUrl: './incentive-rule-form-dialog.component.css',
})
export class IncentiveRuleFormDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly scopeOptions = inject(RuleScopeOptionsService);
  protected readonly data = inject<IncentiveRuleFormDialogData>(DIALOG_DATA);

  protected readonly isEdit = this.data.mode === 'edit';
  protected readonly editing = this.data.mode === 'edit' ? this.data.rule : null;
  protected readonly saving = this.store.selectSignal(selectIncentiveRulesSaving);
  private readonly crudError = this.store.selectSignal(selectIncentiveRulesCrudError);

  protected readonly scopeTypeOptions: SelectOption[] = [
    { value: 'GLOBAL', label: 'All partners' },
    { value: 'PARTNER_TYPE', label: 'A partner type' },
    { value: 'ORGANISATION_TYPE', label: 'An organisation type' },
    { value: 'ORGANISATION', label: 'A specific organisation' },
  ];
  private readonly allBeneficiaryOptions: SelectOption[] = (
    ['PARTNER', 'ORGANISATION', 'ORGANISATION + CONSULTER'] as IncentiveBeneficiary[]
  ).map((b) => ({ value: b, label: INCENTIVE_BENEFICIARY_LABEL[b] }));

  private readonly partnerTypeOpts = toSignal(this.scopeOptions.partnerTypeOptions$, {
    initialValue: [] as SelectOption[],
  });
  private readonly organisationTypeOpts = toSignal(this.scopeOptions.organisationTypeOptions$, {
    initialValue: [] as SelectOption[],
  });
  private readonly organisationOpts = toSignal(this.scopeOptions.organisationOptions$, {
    initialValue: [] as SelectOption[],
  });

  protected readonly form = this.buildForm(this.editing ?? undefined);

  protected readonly scopeType = toSignal(this.form.controls.scopeType.valueChanges, {
    initialValue: this.form.controls.scopeType.value,
  });

  protected readonly beneficiary = toSignal(this.form.controls.beneficiary.valueChanges, {
    initialValue: this.form.controls.beneficiary.value,
  });

  protected readonly showConsulter = computed(() => this.beneficiary() === 'ORGANISATION + CONSULTER');

  protected readonly beneficiaryOptions = computed<SelectOption[]>(() => {
    const scope = this.scopeType();
    if (scope === 'PARTNER_TYPE') return this.allBeneficiaryOptions.filter((o) => o.value === 'PARTNER');
    if (scope === 'ORGANISATION_TYPE' || scope === 'ORGANISATION') return this.allBeneficiaryOptions.filter((o) => o.value !== 'PARTNER');
    return this.allBeneficiaryOptions;
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
    effect(() => {
      const scope = this.scopeType();
      const ctrl = this.form.controls.beneficiary;
      if (scope === 'PARTNER_TYPE') {
        ctrl.setValue('PARTNER', { emitEvent: false });
        ctrl.disable({ emitEvent: false });
      } else {
        ctrl.enable({ emitEvent: false });
        if (scope === 'ORGANISATION_TYPE' || scope === 'ORGANISATION') {
          if (ctrl.value === 'PARTNER') ctrl.setValue('ORGANISATION', { emitEvent: false });
        }
      }
    });

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

    effect(() => {
      const err = this.crudError();
      const nameErr = err?.fieldErrors?.['name']?.[0];
      if (nameErr) this.form.controls.name.setErrors({ server: nameErr });
    });

    this.actions$
      .pipe(
        ofType(IncentiveRuleActions.createSuccess, IncentiveRuleActions.updateSuccess),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.dialogRef.close(true));
  }

  private buildForm(rule?: IncentiveRule) {
    return this.fb.group({
      name: this.fb.control(rule?.name ?? '', [Validators.required, Validators.maxLength(80)]),
      scopeType: this.fb.control<RuleScopeType>(rule?.scopeType ?? 'PARTNER_TYPE', [
        Validators.required,
      ]),
      scopeId: this.fb.control(rule?.scopeId ?? ''),
      beneficiary: this.fb.control<IncentiveBeneficiary>(rule?.beneficiary ?? 'PARTNER', [
        Validators.required,
      ]),
      counselling: makeIncentiveComponentGroup(this.fb, rule?.counselling),
      firstPurchase: makeIncentiveComponentGroup(
        this.fb,
        rule?.firstPurchase ?? { kind: 'PERCENT', percent: 5 },
      ),
      renewal: makeRenewalGroup(this.fb, rule?.renewal),
      consulterCounselling: makeIncentiveComponentGroup(this.fb, rule?.consulterCounselling),
      consulterFirstPurchase: makeIncentiveComponentGroup(
        this.fb,
        rule?.consulterFirstPurchase ?? { kind: 'PERCENT', percent: 5 },
      ),
      consulterRenewal: makeRenewalGroup(this.fb, rule?.consulterRenewal),
      active: this.fb.control(rule ? rule.status === 'ACTIVE' : true),
      effectiveFrom: this.fb.control(
        rule?.effectiveFrom ?? new Date().toISOString().slice(0, 10),
        [Validators.required],
      ),
    });
  }

  protected genericError(): string | null {
    const err = this.crudError();
    if (!err || err.status === 422) return null;
    return err.message;
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const withConsulter = raw.beneficiary === 'ORGANISATION + CONSULTER';
    const payload: CreateIncentiveRulePayload = {
      name: raw.name.trim(),
      scopeType: raw.scopeType,
      scopeId: raw.scopeType === 'GLOBAL' ? undefined : raw.scopeId,
      beneficiary: raw.beneficiary,
      counselling: readIncentiveComponent(this.form.controls.counselling),
      firstPurchase: readIncentiveComponent(this.form.controls.firstPurchase),
      renewal: readRenewalIncentive(this.form.controls.renewal),
      consulterCounselling: withConsulter ? readIncentiveComponent(this.form.controls.consulterCounselling) : undefined,
      consulterFirstPurchase: withConsulter ? readIncentiveComponent(this.form.controls.consulterFirstPurchase) : undefined,
      consulterRenewal: withConsulter ? readRenewalIncentive(this.form.controls.consulterRenewal) : undefined,
      status: (raw.active ? 'ACTIVE' : 'INACTIVE') as EntityStatus,
      effectiveFrom: raw.effectiveFrom,
    };

    if (this.data.mode === 'edit') {
      this.store.dispatch(IncentiveRuleActions.update({ id: this.data.rule.id, payload }));
    } else {
      this.store.dispatch(IncentiveRuleActions.create({ payload }));
    }
  }
}
