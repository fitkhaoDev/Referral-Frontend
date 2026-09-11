import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';
import { Money } from '@core/models/money.model';

/**
 * Formats a {@link Money} value for display. Performs NO arithmetic — it only
 * divides integer minor units by 100 for presentation. A `null` / `undefined` value
 * renders as an em dash. `showSign` prefixes a `+` for positive amounts (wallet ledger).
 */
@Pipe({ name: 'money', standalone: false })
export class MoneyPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(
    value: Money | null | undefined,
    options: { showSign?: boolean; fractionDigits?: 0 | 2 } = {},
  ): string {
    if (value == null) return '—';
    const major = value.minorUnits / 100;
    const fraction = options.fractionDigits ?? (Number.isInteger(major) ? 0 : 2);
    const formatted = new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: value.currency,
      minimumFractionDigits: fraction,
      maximumFractionDigits: fraction,
    }).format(Math.abs(major));

    if (major < 0) return `-${formatted}`;
    if (options.showSign && major > 0) return `+${formatted}`;
    return formatted;
  }
}
