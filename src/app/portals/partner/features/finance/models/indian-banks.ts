/**
 * Static list of Indian banks with their IFSC prefix (first 4 chars of IFSC).
 * The IFSC prefix is the authoritative bank identifier — the backend derives
 * the bank name from the user's full IFSC via the public IFSC lookup. This
 * list is only a UX convenience so partners can pick their bank from a
 * dropdown instead of recalling the IFSC format.
 */
export interface IndianBank {
  code: string; // IFSC prefix, e.g. 'HDFC'
  name: string;
}

export const INDIAN_BANKS: readonly IndianBank[] = [
  { code: 'SBIN', name: 'State Bank of India' },
  { code: 'HDFC', name: 'HDFC Bank' },
  { code: 'ICIC', name: 'ICICI Bank' },
  { code: 'AXIS', name: 'Axis Bank' },
  { code: 'KKBK', name: 'Kotak Mahindra Bank' },
  { code: 'YESB', name: 'Yes Bank' },
  { code: 'IDFB', name: 'IDFC First Bank' },
  { code: 'INDB', name: 'IndusInd Bank' },
  { code: 'PUNB', name: 'Punjab National Bank' },
  { code: 'BARB', name: 'Bank of Baroda' },
  { code: 'CNRB', name: 'Canara Bank' },
  { code: 'UBIN', name: 'Union Bank of India' },
  { code: 'IOBA', name: 'Indian Overseas Bank' },
  { code: 'IDIB', name: 'Indian Bank' },
  { code: 'CBIN', name: 'Central Bank of India' },
  { code: 'BKID', name: 'Bank of India' },
  { code: 'MAHB', name: 'Bank of Maharashtra' },
  { code: 'UCBA', name: 'UCO Bank' },
  { code: 'PSIB', name: 'Punjab & Sind Bank' },
  { code: 'FDRL', name: 'Federal Bank' },
  { code: 'SIBL', name: 'South Indian Bank' },
  { code: 'KVBL', name: 'Karur Vysya Bank' },
  { code: 'CIUB', name: 'City Union Bank' },
  { code: 'TMBL', name: 'Tamilnad Mercantile Bank' },
  { code: 'KARB', name: 'Karnataka Bank' },
  { code: 'DLXB', name: 'Dhanlaxmi Bank' },
  { code: 'RATN', name: 'RBL Bank' },
  { code: 'BDBL', name: 'Bandhan Bank' },
  { code: 'CSBK', name: 'CSB Bank' },
  { code: 'DCBL', name: 'DCB Bank' },
  { code: 'ESFB', name: 'Equitas Small Finance Bank' },
  { code: 'AUBL', name: 'AU Small Finance Bank' },
  { code: 'UJVN', name: 'Ujjivan Small Finance Bank' },
  { code: 'ESMF', name: 'ESAF Small Finance Bank' },
  { code: 'JSBP', name: 'Jana Small Finance Bank' },
  { code: 'SURY', name: 'Suryoday Small Finance Bank' },
  { code: 'FINO', name: 'Fino Payments Bank' },
  { code: 'IPOS', name: 'India Post Payments Bank' },
  { code: 'AIRP', name: 'Airtel Payments Bank' },
  { code: 'PYTM', name: 'Paytm Payments Bank' },
  { code: 'CITI', name: 'Citibank' },
  { code: 'HSBC', name: 'HSBC Bank' },
  { code: 'SCBL', name: 'Standard Chartered Bank' },
  { code: 'DEUT', name: 'Deutsche Bank' },
  { code: 'BOFA', name: 'Bank of America' },
  { code: 'DBSS', name: 'DBS Bank India' },
  { code: 'BNPA', name: 'BNP Paribas' },
  { code: 'JAKA', name: 'Jammu & Kashmir Bank' },
  { code: 'ORBC', name: 'Oriental Bank of Commerce' },
  { code: 'SYNB', name: 'Syndicate Bank' },
  { code: 'ANDB', name: 'Andhra Bank' },
  { code: 'CORP', name: 'Corporation Bank' },
  { code: 'VIJB', name: 'Vijaya Bank' },
  { code: 'ALLA', name: 'Allahabad Bank' },
  { code: 'UTBI', name: 'United Bank of India' },
] as const;

export const BANK_BY_IFSC_PREFIX = new Map(INDIAN_BANKS.map((b) => [b.code, b.name]));
