import { TestBed } from '@angular/core/testing';
import { PlaceholderComponent } from './placeholder.component';

describe('PlaceholderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlaceholderComponent],
    }).compileComponents();
  });

  it('renders the label from route data', () => {
    const fixture = TestBed.createComponent(PlaceholderComponent);
    fixture.componentRef.setInput('label', 'Commissions');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Commissions');
  });
});
