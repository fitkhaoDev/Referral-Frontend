import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../shared.module';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Component({
  standalone: true,
  imports: [SharedModule],
  template: `
    <app-filter-bar
      [searchTerm]="term"
      [activeCount]="count"
      (searchChange)="lastSearch = $event"
      (clearAll)="cleared = cleared + 1"
    >
      <span class="a-filter">filter control</span>
    </app-filter-bar>
  `,
})
class HostComponent {
  term = '';
  count = 0;
  lastSearch = '';
  cleared = 0;
}

describe('FilterBarComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('projects filter controls', () => {
    expect(fixture.nativeElement.querySelector('.a-filter')).toBeTruthy();
  });

  it('debounces search input before emitting', async () => {
    const input = fixture.nativeElement.querySelector('input[type=search]') as HTMLInputElement;
    input.value = 'apo';
    input.dispatchEvent(new Event('input'));
    input.value = 'apollo';
    input.dispatchEvent(new Event('input'));

    await wait(150);
    fixture.detectChanges();
    expect(fixture.componentInstance.lastSearch).toBe('');

    await wait(300);
    fixture.detectChanges();
    expect(fixture.componentInstance.lastSearch).toBe('apollo');
  });

  it('shows Clear all only when filters are active and emits clearAll', () => {
    expect(fixture.nativeElement.querySelector('.fbar__clear')).toBeNull();
    fixture.componentInstance.count = 2;
    fixture.detectChanges();
    const clear = fixture.nativeElement.querySelector('.fbar__clear') as HTMLButtonElement;
    expect(clear).toBeTruthy();
    clear.click();
    expect(fixture.componentInstance.cleared).toBe(1);
  });
});
