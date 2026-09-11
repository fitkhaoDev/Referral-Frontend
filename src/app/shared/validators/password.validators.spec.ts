import { FormControl, FormGroup } from '@angular/forms';
import { matchWith, strongPassword } from './password.validators';

describe('strongPassword', () => {
  const validate = strongPassword();

  it('passes a compliant password', () => {
    expect(validate(new FormControl('NewPass123'))).toBeNull();
  });

  it('reports every missing rule', () => {
    const result = validate(new FormControl('weak'));
    expect(result?.['weakPassword']).toEqual(
      expect.arrayContaining(['at least 8 characters', 'an uppercase letter', 'a number']),
    );
  });

  it('ignores an empty value (required handles that)', () => {
    expect(validate(new FormControl(''))).toBeNull();
  });
});

describe('matchWith', () => {
  it('fails when the sibling control differs', () => {
    const group = new FormGroup({
      a: new FormControl('one'),
      b: new FormControl('two', { validators: [matchWith('a')] }),
    });
    group.controls.b.updateValueAndValidity();
    expect(group.controls.b.errors).toEqual({ mismatch: true });
  });

  it('passes when values match', () => {
    const group = new FormGroup({
      a: new FormControl('same'),
      b: new FormControl('same', { validators: [matchWith('a')] }),
    });
    group.controls.b.updateValueAndValidity();
    expect(group.controls.b.errors).toBeNull();
  });
});
