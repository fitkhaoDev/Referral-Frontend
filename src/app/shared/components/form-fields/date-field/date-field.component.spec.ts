import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { SharedModule } from '../../../shared.module';
import { DateFieldComponent } from './date-field.component';

describe('DateFieldComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SharedModule] }).compileComponents();
  });

  it('binds an ISO date string to the control', () => {
    const fixture = TestBed.createComponent(DateFieldComponent);
    const control = new FormControl('', { nonNullable: true });
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('label', 'From');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type=date]') as HTMLInputElement;
    input.value = '2026-09-01';
    input.dispatchEvent(new Event('input'));
    expect(control.value).toBe('2026-09-01');
  });
});
