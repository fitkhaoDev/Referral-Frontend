import { TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';

describe('LogoComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ declarations: [LogoComponent] }).compileComponents();
  });

  it('renders the logo image at the requested size', () => {
    const fixture = TestBed.createComponent(LogoComponent);
    fixture.componentRef.setInput('size', 30);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('src')).toBe('logo_app.png');
    expect(img.getAttribute('width')).toBe('30');
  });

  it('hides the wordmark when showWordmark is false', () => {
    const fixture = TestBed.createComponent(LogoComponent);
    fixture.componentRef.setInput('showWordmark', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.logo__word')).toBeNull();
    expect(fixture.nativeElement.querySelector('img').getAttribute('alt')).toBe('FitKhao');
  });
});
