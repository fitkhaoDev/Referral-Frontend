/**
 * Shared seed data so the Organisations and Organisation Members mock APIs stay
 * consistent with each other. Development-only fixtures — no financial logic.
 */
import { fixtureId } from '@core/data-access/mock/mock-http.util';
import { EntityStatus } from '@core/models/common.model';

export interface OrgSeed {
  readonly id: string;
  readonly partnerId: string;
  readonly name: string;
  readonly organisationTypeId: string;
  readonly organisationTypeName: string;
  readonly referralCode: string;
  readonly contactPerson: string;
  readonly mobile: string;
  readonly email: string;
  readonly address: string;
  readonly status: EntityStatus;
}

export interface MemberSeed {
  readonly id: string;
  readonly organisationId: string;
  readonly name: string;
  readonly specialisation?: string;
  readonly mobile: string;
  readonly email: string;
  readonly status: EntityStatus;
}

const RAW_ORGS: Array<Omit<OrgSeed, 'id' | 'partnerId'>> = [
  {
    name: 'Apollo Hospital — Dum Dum',
    organisationTypeId: 'otype-000001',
    organisationTypeName: 'Hospital',
    referralCode: 'APOLLO-DUMDUM',
    contactPerson: 'Sunita Basu',
    mobile: '+91 9830011111',
    email: 'partnerships.dumdum@apollo.example.com',
    address: '227 Jessore Road, Dum Dum, Kolkata 700028',
    status: 'ACTIVE',
  },
  {
    name: 'Fortis Clinic — Bandra',
    organisationTypeId: 'otype-000002',
    organisationTypeName: 'Clinic',
    referralCode: 'FORTIS-BANDRA',
    contactPerson: 'Rahul Kamat',
    mobile: '+91 9821022222',
    email: 'referrals.bandra@fortis.example.com',
    address: 'Linking Road, Bandra West, Mumbai 400050',
    status: 'ACTIVE',
  },
  {
    name: 'HealthFirst Diagnostics — Koramangala',
    organisationTypeId: 'otype-000003',
    organisationTypeName: 'Diagnostic Centre',
    referralCode: 'HF-KORAMANGALA',
    contactPerson: 'Deepa Iyer',
    mobile: '+91 9900033333',
    email: 'partners.koramangala@healthfirst.example.com',
    address: '80 Feet Road, Koramangala, Bengaluru 560095',
    status: 'ACTIVE',
  },
  {
    name: 'PulseFit Gym — Gurugram',
    organisationTypeId: 'otype-000004',
    organisationTypeName: 'Gym Chain',
    referralCode: 'PULSEFIT-GGN',
    contactPerson: 'Aman Chopra',
    mobile: '+91 9811044444',
    email: 'growth.ggn@pulsefit.example.com',
    address: 'Sector 29, Gurugram 122001',
    status: 'ACTIVE',
  },
  {
    name: 'CarePlus Corporate Wellness',
    organisationTypeId: 'otype-000005',
    organisationTypeName: 'Corporate',
    referralCode: 'CAREPLUS-CORP',
    contactPerson: 'Nandini Rao',
    mobile: '+91 9845055555',
    email: 'wellness@careplus.example.com',
    address: 'Cyber Towers, Hitec City, Hyderabad 500081',
    status: 'INACTIVE',
  },
];

export const ORGANISATION_SEED: OrgSeed[] = RAW_ORGS.map((o, i) => ({
  ...o,
  id: fixtureId('org', i + 1),
  partnerId: `FK-ORG-${String(i + 1).padStart(6, '0')}`,
}));

const MEMBER_NAMES: Array<[orgIndex: number, name: string, spec: string, status: EntityStatus]> = [
  [0, 'Dr. John Doe', 'Cardiology', 'ACTIVE'],
  [0, 'Dr. Priya Sen', 'Endocrinology', 'ACTIVE'],
  [0, 'Dr. Arindam Roy', 'Orthopaedics', 'ACTIVE'],
  [0, 'Dr. Meera Ghosh', 'General Medicine', 'INACTIVE'],
  [1, 'Dr. Anaya Mehta', 'Nutrition', 'ACTIVE'],
  [1, 'Dr. Vivek Kamat', 'Sports Medicine', 'ACTIVE'],
  [2, 'Dr. Sana Iqbal', 'Pathology', 'ACTIVE'],
  [2, 'Dr. Rohan Iyer', 'Radiology', 'ACTIVE'],
  [3, 'Karan Malhotra', 'Strength & Conditioning', 'ACTIVE'],
  [3, 'Ritu Sharma', 'Physiotherapy', 'ACTIVE'],
  [4, 'Dr. Alok Verma', 'Occupational Health', 'INACTIVE'],
];

export const ORGANISATION_MEMBER_SEED: MemberSeed[] = MEMBER_NAMES.map(
  ([orgIndex, name, spec, status], i) => ({
    id: fixtureId('omember', i + 1),
    organisationId: ORGANISATION_SEED[orgIndex].id,
    name,
    specialisation: spec,
    mobile: `+91 9${String(700000000 + i * 123457).slice(0, 9)}`,
    email: `${name.replace(/^Dr\.?\s+/i, '').split(' ')[0].toLowerCase()}.${i + 1}@org.example.com`,
    status,
  }),
);

export function memberCountFor(organisationId: string): number {
  return ORGANISATION_MEMBER_SEED.filter((m) => m.organisationId === organisationId).length;
}
