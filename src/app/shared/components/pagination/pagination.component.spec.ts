import { TestBed } from '@angular/core/testing';
import { PaginationComponent, PageChange } from './pagination.component';

describe('PaginationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaginationComponent],
    }).compileComponents();
  });

  function make(page: number, size: number, total: number) {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('size', size);
    fixture.componentRef.setInput('totalItems', total);
    fixture.detectChanges();
    return fixture;
  }

  it('computes the visible range', () => {
    const fixture = make(1, 20, 55);
    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('21');
    expect(text).toContain('40');
    expect(text).toContain('55');
  });

  it('disables Prev on the first page and Next on the last', () => {
    const first = make(0, 20, 55);
    const buttons = first.nativeElement.querySelectorAll('.pg__nav button');
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(false);

    const last = make(2, 20, 55);
    const lastButtons = last.nativeElement.querySelectorAll('.pg__nav button');
    expect(lastButtons[1].disabled).toBe(true);
  });

  it('emits next page', () => {
    const fixture = make(0, 20, 55);
    let emitted: PageChange | undefined;
    fixture.componentInstance.pageChange.subscribe((e) => (emitted = e));
    (fixture.nativeElement.querySelectorAll('.pg__nav button')[1] as HTMLButtonElement).click();
    expect(emitted).toEqual({ page: 1, size: 20 });
  });

  it('resets to page 0 when the size changes', () => {
    const fixture = make(3, 20, 200);
    let emitted: PageChange | undefined;
    fixture.componentInstance.pageChange.subscribe((e) => (emitted = e));
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = '50';
    select.dispatchEvent(new Event('change'));
    expect(emitted).toEqual({ page: 0, size: 50 });
  });
});
