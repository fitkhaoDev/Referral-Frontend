import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../shared.module';

@Component({
  standalone: true,
  imports: [SharedModule],
  template: `<app-button [loading]="loading" (pressed)="clicks = clicks + 1">Go</app-button>`,
})
class HostComponent {
  loading = false;
  clicks = 0;
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  it('projects its label', () => {
    expect(button().textContent).toContain('Go');
  });

  it('emits pressed on click', () => {
    button().click();
    expect(fixture.componentInstance.clicks).toBe(1);
  });

  it('is disabled and aria-busy while loading', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
    expect(button().getAttribute('aria-busy')).toBe('true');
  });
});
