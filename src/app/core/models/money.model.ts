/**
 * Money value object.
 *
 * The client NEVER performs financial arithmetic (commission, incentive, wallet,
 * withdrawal amounts). It only transports and renders values the backend computed.
 * Amounts are carried as integer minor units to keep them exact across the wire and
 * in display aggregation.
 */
export interface Money {
  /** Integer amount in the currency's minor unit (paise for INR). Never a float. */
  readonly minorUnits: number;
  /** ISO 4217 currency code, e.g. `"INR"`. */
  readonly currency: string;
}

/** Construct a Money from a major-unit value (e.g. rupees). Fixture/util helper only. */
export function money(majorUnits: number, currency = 'INR'): Money {
  return { minorUnits: Math.round(majorUnits * 100), currency };
}

/** Major-unit number for formatting. Not for business math. */
export function toMajorUnits(value: Money): number {
  return value.minorUnits / 100;
}

/** Zero of a given currency, for empty/placeholder display. */
export function zeroMoney(currency = 'INR'): Money {
  return { minorUnits: 0, currency };
}

export function isNegativeMoney(value: Money): boolean {
  return value.minorUnits < 0;
}

export function isPositiveMoney(value: Money): boolean {
  return value.minorUnits > 0;
}
