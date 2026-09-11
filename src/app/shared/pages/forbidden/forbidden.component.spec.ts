import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { ForbiddenComponent } from './forbidden.component';

describe('ForbiddenComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [ForbiddenComponent],
    }).compileComponents();
  });

  it('links back to the provided home path', () => {
    const fixture = TestBed.createComponent(ForbiddenComponent);
    fixture.componentRef.setInput('home', '/admin');
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('href')).toBe('/admin');
  });
});
