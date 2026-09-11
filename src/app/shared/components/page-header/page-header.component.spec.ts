import { TestBed } from '@angular/core/testing';
import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageHeaderComponent],
    }).compileComponents();
  });

  it('renders the title and count', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentRef.setInput('title', 'Partners');
    fixture.componentRef.setInput('count', 12);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Partners');
    expect(text).toContain('12');
  });
});
