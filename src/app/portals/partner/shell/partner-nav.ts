export interface PartnerNavItem {
  readonly label: string;
  readonly path: string;
  /** Short glyph for the mobile bottom bar. */
  readonly glyph: string;
}

/** Partner portal primary navigation — sized for a mobile bottom tab bar. */
export const PARTNER_NAV: readonly PartnerNavItem[] = [
  { label: 'Dashboard', path: '/partner/dashboard', glyph: '▦' },
  { label: 'Referrals', path: '/partner/referrals', glyph: '↗' },
  { label: 'Wallet', path: '/partner/wallet', glyph: '▣' },
  { label: 'Withdrawals', path: '/partner/withdrawals', glyph: '⇩' },
  { label: 'Profile', path: '/partner/profile', glyph: '☺' },
];
