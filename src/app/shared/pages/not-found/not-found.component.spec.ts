import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [NotFoundComponent],
    }).compileComponents();
  });

  it('shows the 404 message', () => {
    const fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Page not found');
  });
});
