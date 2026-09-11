import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { SharedModule } from '../../../shared.module';

@Component({
  standalone: true,
  imports: [SharedModule],
  template: `
    <app-select-field
      [control]="control"
      label="Category"
      placeholder="Choose…"
      [options]="options"
      requiredMark
    ></app-select-field>
  `,
})
class HostComponent {
  control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  options = [
    { value: 'INDIVIDUAL', label: 'Individual' },
    { value: 'ORGANISATION', label: 'Organisation' },
  ];
}

describe('SelectFieldComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('renders placeholder + options', () => {
    const options = fixture.nativeElement.querySelectorAll('option');
    expect(options.length).toBe(3);
    expect(options[0].textContent).toContain('Choose…');
  });

  it('shows the required error when touched empty', () => {
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.field__error').textContent).toContain(
      'Category is required.',
    );
  });
});
