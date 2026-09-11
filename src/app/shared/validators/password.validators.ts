import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Client-side password policy — a UX pre-check only. The backend enforces the
 * authoritative policy and returns `AUTH_PASSWORD_POLICY` with field errors. Keep
 * the two rules in sync when the backend policy is finalised.
 */
export function strongPassword(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) return null;
    const failed: string[] = [];
    if (value.length < 8) failed.push('at least 8 characters');
    if (!/[A-Z]/.test(value)) failed.push('an uppercase letter');
    if (!/[a-z]/.test(value)) failed.push('a lowercase letter');
    if (!/[0-9]/.test(value)) failed.push('a number');
    return failed.length ? { weakPassword: failed } : null;
  };
}

/** Cross-field: this control must equal the sibling control named `otherName`. */
export function matchWith(otherName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const other = control.parent?.get(otherName);
    if (!other) return null;
    return control.value === other.value ? null : { mismatch: true };
  };
}
