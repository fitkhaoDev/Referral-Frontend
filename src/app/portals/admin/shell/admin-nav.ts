export interface NavItem {
  readonly label: string;
  readonly path: string;
  /** Permission required to see this item; omit for always-visible. */
  readonly permission?: string;
}

export interface NavGroup {
  readonly heading: string;
  readonly items: readonly NavItem[];
}

/** Admin portal navigation model. Order and grouping are intentional. */
export const ADMIN_NAV: readonly NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { label: 'Analytics', path: '/admin/analytics', permission: 'analytics:read' },
    ],
  },
  {
    heading: 'Partners',
    items: [
      { label: 'Partners', path: '/admin/partners', permission: 'partner:read' },
      { label: 'Partner types', path: '/admin/partner-types', permission: 'partner-type:manage' },
    ],
  },
  {
    heading: 'Organisations',
    items: [
      { label: 'Organisations', path: '/admin/organisations', permission: 'organisation:manage' },
      {
        label: 'Organisation types',
        path: '/admin/organisation-types',
        permission: 'organisation-type:manage',
      },
      {
        label: 'Organisation members',
        path: '/admin/organisation-members',
        permission: 'organisation-member:manage',
      },
    ],
  },
  {
    heading: 'Referrals',
    items: [
      { label: 'Referrals', path: '/admin/referrals', permission: 'referral:read' },
      {
        label: 'Referral events',
        path: '/admin/referral-events',
        permission: 'referral-event:manage',
      },
    ],
  },
  {
    heading: 'Finance',
    items: [
      {
        label: 'Incentive rules',
        path: '/admin/incentive-rules',
        permission: 'incentive-rule:manage',
      },
      { label: 'Discount rules', path: '/admin/discount-rules', permission: 'discount-rule:manage' },
      { label: 'Commissions', path: '/admin/commissions', permission: 'commission:read' },
      { label: 'Wallets', path: '/admin/wallet', permission: 'wallet:read' },
      { label: 'Withdrawals', path: '/admin/withdrawals', permission: 'withdrawal:read' },
    ],
  },
  {
    heading: 'Account',
    items: [{ label: 'Profile', path: '/admin/profile' }],
  },
];
