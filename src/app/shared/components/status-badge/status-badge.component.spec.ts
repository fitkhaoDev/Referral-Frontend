import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatusBadgeComponent],
    }).compileComponents();
  });

  it('renders label and tone class', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('label', 'Available');
    fixture.componentRef.setInput('tone', 'success');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.badge');
    expect(el.textContent).toContain('Available');
    expect(el.classList).toContain('badge--success');
  });
});
