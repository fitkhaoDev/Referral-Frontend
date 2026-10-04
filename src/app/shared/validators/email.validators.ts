import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/**
 * Email validator that ALSO rejects any uppercase letter. Returns:
 *   - `null` when empty (defer required-ness to Validators.required)
 *   - `{ email: true }` when the format isn't a valid email
 *   - `{ uppercase: true }` when the format is valid but contains A–Z
 */
export function lowercaseEmail(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = String(control.value ?? '');
    if (!raw) return null;
    const formatErr = Validators.email(control);
    if (formatErr) return formatErr;
    if (/[A-Z]/.test(raw)) return { uppercase: true };
    return null;
  };
}
