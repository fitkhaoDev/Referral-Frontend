import { TestBed } from '@angular/core/testing';
import { LogoComponent } from '../logo/logo.component';
import { AuthLayoutComponent } from './auth-layout.component';

describe('AuthLayoutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthLayoutComponent, LogoComponent],
    }).compileComponents();
  });

  it('renders heading and eyebrow', () => {
    const fixture = TestBed.createComponent(AuthLayoutComponent);
    fixture.componentRef.setInput('eyebrow', 'Admin portal');
    fixture.componentRef.setInput('heading', 'Sign in to FitKhao Admin');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Admin portal');
    expect(text).toContain('Sign in to FitKhao Admin');
  });
});
