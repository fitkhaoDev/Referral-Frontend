import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { SharedModule } from '../../../shared.module';

@Component({
  standalone: true,
  imports: [SharedModule],
  template: `
    <app-switch-field
      [control]="control"
      label="Active"
      onText="Active"
      offText="Inactive"
    ></app-switch-field>
  `,
})
class HostComponent {
  control = new FormControl(false, { nonNullable: true });
}

describe('SwitchFieldComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('reflects the control value as on/off text', async () => {
    expect(fixture.nativeElement.querySelector('.sw__state').textContent).toContain('Inactive');
    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sw__state').textContent).toContain('Active');
  });

  it('uses role="switch"', () => {
    expect(fixture.nativeElement.querySelector('input').getAttribute('role')).toBe('switch');
  });
});
