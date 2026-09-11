import { TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmptyStateComponent],
    }).compileComponents();
  });

  it('shows the default title', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nothing here yet');
  });

  it('adds the error modifier for the error tone', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('tone', 'error');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty').classList).toContain('empty--error');
  });
});
