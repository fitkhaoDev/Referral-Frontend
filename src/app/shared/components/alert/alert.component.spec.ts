import { TestBed } from '@angular/core/testing';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ declarations: [AlertComponent] }).compileComponents();
  });

  it('creates', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('uses role="alert" for the error tone', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    fixture.componentRef.setInput('tone', 'error');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alert').getAttribute('role')).toBe('alert');
  });

  it('uses role="status" for non-error tones', () => {
    const fixture = TestBed.createComponent(AlertComponent);
    fixture.componentRef.setInput('tone', 'success');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alert').getAttribute('role')).toBe('status');
  });
});
