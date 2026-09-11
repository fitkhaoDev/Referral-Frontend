import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared.module';

@Component({
  standalone: true,
  imports: [SharedModule],
  template: `
    <app-dialog-shell title="Edit item" subtitle="Sub" (dismissed)="dismissed = true">
      <p>Body</p>
      <button footer type="button">Save</button>
    </app-dialog-shell>
  `,
})
class HostComponent {
  dismissed = false;
}

describe('DialogShellComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('renders title, projected body and footer', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.dlg__title')?.textContent).toContain('Edit item');
    expect(el.querySelector('.dlg__body')?.textContent).toContain('Body');
    expect(el.querySelector('.dlg__footer button')?.textContent).toContain('Save');
  });

  it('emits dismissed when the close button is pressed', () => {
    (fixture.nativeElement.querySelector('.dlg__close') as HTMLButtonElement).click();
    expect(fixture.componentInstance.dismissed).toBe(true);
  });
});
