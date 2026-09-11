import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEnIn from '@angular/common/locales/en-IN';
import { TestBed } from '@angular/core/testing';
import { money } from '@core/models/money.model';
import { MoneyPipe } from './money.pipe';

registerLocaleData(localeEnIn);

describe('MoneyPipe', () => {
  let pipe: MoneyPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MoneyPipe, { provide: LOCALE_ID, useValue: 'en-IN' }],
    });
    pipe = TestBed.inject(MoneyPipe);
  });

  it('renders an em dash for null', () => {
    expect(pipe.transform(null)).toBe('—');
  });

  it('formats whole rupees with no decimals', () => {
    expect(pipe.transform(money(1800))).toContain('1,800');
  });

  it('prefixes a plus sign when requested for positive amounts', () => {
    expect(pipe.transform(money(300), { showSign: true }).startsWith('+')).toBe(true);
  });

  it('renders negative amounts with a leading minus', () => {
    expect(pipe.transform(money(-100)).startsWith('-')).toBe(true);
  });
});
