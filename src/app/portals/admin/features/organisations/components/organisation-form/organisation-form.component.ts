import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiError } from '@core/models/api.model';
import { SelectOption } from '@shared/components/form-fields/select-field/select-field.component';
import { matchWith, strongPassword } from '@shared/validators/password.validators';
import {
  CreateOrganisationPayload,
  Organisation,
  UpdateOrganisationPayload,
} from '../../models/organisation.model';

export type OrganisationFormMode = 'create' | 'edit';

/**
 * Reusable organisation enrolment / edit form. Create mode also collects the
 * organisation's referral code and an admin-set temporary password; edit mode hides
 * those (system-controlled). Emits a payload matching the mode.
 */
@Component({
  selector: 'app-organisation-form',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organisation-form.component.html',
  styleUrl: './organisation-form.component.css',
})
export class OrganisationFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly mode = input.required<OrganisationFormMode>();
  readonly organisation = input<Organisation | null>(null);
  readonly typeOptions = input<SelectOption[]>([]);
  readonly saving = input(false);
  readonly saveError = input<ApiError | null>(null);

  readonly save = output<CreateOrganisationPayload | UpdateOrganisationPayload>();
  readonly cancel = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(140)]],
    organisationTypeId: ['', [Validators.required]],
    referralCode: ['', [Validators.pattern(/^[A-Z0-9-]{4,32}$/)]],
    contactPerson: ['', [Validators.required, Validators.maxLength(120)]],
    mobile: ['', [Validators.required, Validators.pattern(/^[+0-9 ()-]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required, Validators.maxLength(280)]],
    status: [true],
    initialPassword: [''],
    confirmPassword: [''],
  });

  constructor() {
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
      const o = this.organisation();
      if (o) {
        this.form.patchValue(
          {
            name: o.name,
            organisationTypeId: o.organisationTypeId,
            referralCode: o.referralCode,
            contactPerson: o.contactPerson,
            mobile: o.mobile,
            email: o.email,
            address: o.address,
            status: o.status === 'ACTIVE',
          },
          { emitEvent: false },
        );
      }
    });

    effect(() => {
      const err = this.saveError();
      if (!err?.fieldErrors) return;
      for (const [key, messages] of Object.entries(err.fieldErrors)) {
        const control = this.form.get(key);
        if (control && messages[0]) control.setErrors({ server: messages[0] });
      }
    });

    this.form.controls.referralCode.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const upper = value.toUpperCase();
      if (upper !== value) this.form.controls.referralCode.setValue(upper, { emitEvent: false });
    });

    this.form.controls.initialPassword.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmPassword.updateValueAndValidity());
  }

  protected suggestCode(): void {
    const base = this.form.controls.name
      .value.replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toUpperCase()
      .slice(0, 24);
    this.form.controls.referralCode.setValue(base || 'ORG-CODE');
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
      organisationTypeId: raw.organisationTypeId,
      contactPerson: raw.contactPerson.trim(),
      mobile: raw.mobile.trim(),
      email: raw.email.trim(),
      address: raw.address.trim(),
    };

    if (this.mode() === 'create') {
      const payload: CreateOrganisationPayload = {
        ...common,
        referralCode: raw.referralCode.trim().toUpperCase(),
        status: raw.status ? 'ACTIVE' : 'INACTIVE',
        initialPassword: raw.initialPassword,
      };
      this.save.emit(payload);
    } else {
      const payload: UpdateOrganisationPayload = { ...common };
      this.save.emit(payload);
    }
  }
}
