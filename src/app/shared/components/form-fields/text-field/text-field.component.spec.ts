import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { SharedModule } from '../../../shared.module';

@Component({
  standalone: true,
  imports: [SharedModule],
  template: `<app-text-field [control]="control" label="Email" type="email"></app-text-field>`,
})
class HostComponent {
  control = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
}

describe('TextFieldComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('links the label to the input', () => {
    const label = fixture.nativeElement.querySelector('label');
    const input = fixture.nativeElement.querySelector('input');
    expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
  });

  it('shows a validation message once touched', () => {
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('.field__error');
    expect(error.textContent).toContain('Email is required.');
  });

  it('renders a server error verbatim', () => {
    fixture.componentInstance.control.setErrors({ server: 'That email is already in use.' });
    fixture.componentInstance.control.markAsDirty();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.field__error').textContent).toContain(
      'already in use',
    );
  });
});
