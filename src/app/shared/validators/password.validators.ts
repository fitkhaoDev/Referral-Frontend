import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Special symbols accepted by the password policy. */
export const PASSWORD_SPECIAL_CHARS = '! @ # $ % ^ & * _ - + = ?';
const PASSWORD_SPECIAL_RE = /[!@#$%^&*_\-+=?]/;

/**
 * Client-side password policy — a UX pre-check only. The backend enforces the
 * authoritative policy and returns `AUTH_PASSWORD_POLICY` with field errors.
 * Requirements:
 *   • at least 8 characters
 *   • 1 uppercase letter (A–Z)
 *   • 1 lowercase letter (a–z)
 *   • 1 number (0–9)
 *   • 1 special symbol (! @ # $ % ^ & * _ - + = ?)
 * The returned `weakPassword` payload is a string[] of the missing items so the
 * form can render a precise "Password needs: X, Y, Z." message.
 */
export function strongPassword(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) return null;
    const failed: string[] = [];
    if (value.length < 8) failed.push('at least 8 characters');
    if (!/[A-Z]/.test(value)) failed.push('an uppercase letter (A–Z)');
    if (!/[a-z]/.test(value)) failed.push('a lowercase letter (a–z)');
    if (!/[0-9]/.test(value)) failed.push('a number (0–9)');
    if (!PASSWORD_SPECIAL_RE.test(value)) failed.push(`a special symbol (${PASSWORD_SPECIAL_CHARS})`);
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
