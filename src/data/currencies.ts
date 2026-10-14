export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  defaultMonthlyFee: number;
  defaultHourlyFee: number;
  presets: number[];
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  PKR: {
    code: 'PKR',
    name: 'Pakistani Rupee',
    symbol: 'Rs',
    defaultMonthlyFee: 5000,
    defaultHourlyFee: 800,
    presets: [3000, 5000, 8000, 10000, 15000],
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    defaultMonthlyFee: 100,
    defaultHourlyFee: 15,
    presets: [50, 80, 100, 120, 150],
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    defaultMonthlyFee: 80,
    defaultHourlyFee: 15,
    presets: [40, 60, 80, 100, 120],
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    defaultMonthlyFee: 90,
    defaultHourlyFee: 15,
    presets: [45, 70, 90, 110, 130],
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: 'SAR',
    defaultMonthlyFee: 350,
    defaultHourlyFee: 50,
    presets: [150, 250, 350, 450, 600],
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED',
    defaultMonthlyFee: 350,
    defaultHourlyFee: 50,
    presets: [150, 250, 350, 450, 600],
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    defaultMonthlyFee: 120,
    defaultHourlyFee: 20,
    presets: [60, 90, 120, 150, 180],
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'AU$',
    defaultMonthlyFee: 130,
    defaultHourlyFee: 20,
    presets: [65, 95, 130, 160, 200],
  },
};

export const COMMON_COUNTRIES = [
  { name: 'Pakistan', defaultCurrency: 'PKR' },
  { name: 'United States', defaultCurrency: 'USD' },
  { name: 'United Kingdom', defaultCurrency: 'GBP' },
  { name: 'Canada', defaultCurrency: 'CAD' },
  { name: 'Australia', defaultCurrency: 'AUD' },
  { name: 'Saudi Arabia', defaultCurrency: 'SAR' },
  { name: 'United Arab Emirates', defaultCurrency: 'AED' },
  { name: 'Egypt', defaultCurrency: 'USD' },
  { name: 'Morocco', defaultCurrency: 'EUR' },
  { name: 'Turkey', defaultCurrency: 'USD' },
  { name: 'Germany', defaultCurrency: 'EUR' },
  { name: 'France', defaultCurrency: 'EUR' },
  { name: 'Qatar', defaultCurrency: 'USD' },
  { name: 'Malaysia', defaultCurrency: 'USD' },
];

export const CURRENCY_LIST: CurrencyInfo[] = Object.values(SUPPORTED_CURRENCIES);

export function getCurrencyInfo(currencyCode?: string): CurrencyInfo {
  if (!currencyCode) return SUPPORTED_CURRENCIES.USD;
  const upper = currencyCode.toUpperCase();
  if (SUPPORTED_CURRENCIES[upper]) {
    return SUPPORTED_CURRENCIES[upper];
  }
  if (upper === 'RS' || upper === 'PKR') return SUPPORTED_CURRENCIES.PKR;
  return {
    code: upper,
    name: upper,
    symbol: upper,
    defaultMonthlyFee: 100,
    defaultHourlyFee: 15,
    presets: [50, 80, 100, 120, 150],
  };
}

export function getCurrencySymbol(currencyCode?: string): string {
  if (!currencyCode) return '$';
  const upper = currencyCode.toUpperCase();
  if (SUPPORTED_CURRENCIES[upper]) {
    return SUPPORTED_CURRENCIES[upper].symbol;
  }
  if (upper === 'RS' || upper === 'PKR') return 'Rs';
  return upper;
}

export function getCurrencyPresets(currencyCode?: string): number[] {
  const info = getCurrencyInfo(currencyCode);
  return info.presets || [50, 80, 100, 120, 150];
}

export const COMMISSION_PERCENTAGE = 15;
export const COMMISSION_RATE = 0.15; // 15% one-time platform commission on first month's fee only
export const TEACHER_PAYOUT_PERCENTAGE = 85; // 85% payout on month 1, 100% on subsequent months

export const QARICONNECT_SUPPORT = {
  whatsapp: '03006856772',
  phone: '03006856772',
  whatsappDisplay: '03006856772',
  whatsappUrl: 'https://wa.me/923006856772',
  paymentMethods: ['EasyPaisa', 'JazzCash', 'Bank Transfer'],
  commissionRatePercent: 15,
  commissionNotice: 'One-time 15% platform commission charged ONLY on the first month (0% recurring commission on subsequent months)',
};

export function calculateCommission(fee: number, isFirstMonth: boolean = true) {
  const safeFee = typeof fee === 'number' && !isNaN(fee) && fee > 0 ? fee : 0;
  // 15% one-time commission charged ONLY on the first month; subsequent months 0% commission
  const commissionRate = isFirstMonth ? COMMISSION_RATE : 0;
  const commissionAmount = Number((safeFee * commissionRate).toFixed(2));
  const teacherPayout = Number((safeFee - commissionAmount).toFixed(2));
  return {
    commissionRate,
    commissionAmount,
    teacherPayout,
    isFirstMonthOnly: true,
  };
}

export function maskContactNumber(contact?: string, isAdmin: boolean = false): string {
  if (!contact || !contact.trim()) return 'Contact Protected by Platform';
  if (isAdmin) return contact;
  const trimmed = contact.trim();
  if (trimmed.length <= 6) return '•••••• (Protected)';
  const visible = trimmed.slice(0, Math.min(7, Math.floor(trimmed.length * 0.45)));
  return `${visible} •••••••`;
}

export function maskEmail(email?: string, isAdmin: boolean = false): string {
  if (!email || !email.trim()) return 'Contact Protected';
  if (isAdmin) return email;
  const parts = email.split('@');
  if (parts.length < 2) return '••••••@protected';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? `${name.slice(0, 2)}••••` : '••••';
  return `${maskedName}@${domain}`;
}

export function formatCurrency(amount: number | undefined | null, currencyCode?: string): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const info = getCurrencyInfo(currencyCode);
  const symbol = info.symbol;

  const formattedNumber =
    val % 1 === 0
      ? val.toLocaleString('en-US')
      : val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (symbol === '$' || symbol === '£' || symbol === '€') {
    return `${symbol}${formattedNumber}`;
  }
  return `${symbol} ${formattedNumber}`;
}
