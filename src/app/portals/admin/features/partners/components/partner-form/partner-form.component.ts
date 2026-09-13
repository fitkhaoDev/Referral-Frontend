import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiError } from '@core/models/api.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { matchWith, strongPassword } from '@shared/validators/password.validators';
import {
  CreatePartnerPayload,
  Partner,
  UpdatePartnerPayload,
} from '../../models/partner.model';

export type PartnerFormMode = 'create' | 'edit';

/**
 * Reusable partner enrolment / edit form. In `create` mode it also collects the
 * referral code and an admin-set temporary password; in `edit` mode those are
 * system-controlled and hidden. Emits a payload matching the mode.
 */
@Component({
  selector: 'app-partner-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner-form.component.html',
  styleUrl: './partner-form.component.css',
})
export class PartnerFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly mode = input.required<PartnerFormMode>();
  readonly partner = input<Partner | null>(null);
  readonly partnerTypeOptions = input<SelectOption[]>([]);
  readonly saving = input(false);
  readonly saveError = input<ApiError | null>(null);

  readonly save = output<CreatePartnerPayload | UpdatePartnerPayload>();
  readonly cancel = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    partnerTypeId: ['', [Validators.required]],
    specialisation: ['', [Validators.maxLength(80)]],
    mobile: ['', [Validators.required, Validators.pattern(/^[+0-9 ()-]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    professionalAddress: ['', [Validators.maxLength(240)]],
    referralCode: ['', [Validators.pattern(/^[A-Z0-9-]{4,24}$/)]],
    status: [true],
    initialPassword: [''],
    confirmPassword: [''],
  });

  constructor() {
    // Configure per-mode validators + initial values.
    effect(() => {
      const mode = this.mode();
      const code = this.form.controls.referralCode;
      const pwd = this.form.controls.initialPassword;
      const confirm = this.form.controls.confirmPassword;

      if (mode === 'create') {
        code.addValidators(Validators.required);
        pwd.addValidators([Validators.required, strongPassword()]);
        confirm.addValidators([Validators.required, matchWith('initialPassword')]);
      } else {
        code.clearValidators();
        pwd.clearValidators();
        confirm.clearValidators();
      }
      code.updateValueAndValidity({ emitEvent: false });
      pwd.updateValueAndValidity({ emitEvent: false });
      confirm.updateValueAndValidity({ emitEvent: false });
    });

    effect(() => {
      const p = this.partner();
      if (p) {
        this.form.patchValue(
          {
            name: p.name,
            partnerTypeId: p.partnerTypeId,
            specialisation: p.specialisation ?? '',
            mobile: p.mobile,
            email: p.email,
            professionalAddress: p.professionalAddress ?? '',
            referralCode: p.referralCode,
            status: p.status === 'ACTIVE',
          },
          { emitEvent: false },
        );
      }
    });

    // Map server field errors.
    effect(() => {
      const err = this.saveError();
      if (!err?.fieldErrors) return;
      for (const [key, messages] of Object.entries(err.fieldErrors)) {
        const control = this.form.get(key === 'initialPassword' ? 'initialPassword' : key);
        if (control && messages[0]) control.setErrors({ server: messages[0] });
      }
    });

    // Uppercase referral code as typed.
    this.form.controls.referralCode.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const upper = value.toUpperCase();
      if (upper !== value) this.form.controls.referralCode.setValue(upper, { emitEvent: false });
    });

    // Re-check confirm when password changes.
    this.form.controls.initialPassword.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmPassword.updateValueAndValidity());
  }

  protected suggestCode(): void {
    const base = this.form.controls.name
      .value.replace(/^Dr\.?\s+/i, '')
      .replace(/[^a-z]/gi, '')
      .toUpperCase()
      .slice(0, 6);
    const suffix = String(Math.floor(Math.random() * 90) + 10);
    this.form.controls.referralCode.setValue(`${base || 'PARTNER'}${suffix}`);
    this.form.controls.referralCode.markAsDirty();
  }

  protected onCancel(): void {
    this.cancel.emit();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const common = {
      name: raw.name.trim(),
      partnerTypeId: raw.partnerTypeId,
      specialisation: raw.specialisation.trim() || undefined,
      mobile: raw.mobile.trim(),
      email: raw.email.trim(),
      professionalAddress: raw.professionalAddress.trim() || undefined,
    };

    if (this.mode() === 'create') {
      const payload: CreatePartnerPayload = {
        ...common,
        referralCode: raw.referralCode.trim().toUpperCase(),
        status: raw.status ? 'ACTIVE' : 'INACTIVE',
        initialPassword: raw.initialPassword,
      };
      this.save.emit(payload);
    } else {
      const payload: UpdatePartnerPayload = { ...common };
      this.save.emit(payload);
    }
  }
}
