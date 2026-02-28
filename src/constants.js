// =====================================================
// constants.js — Global constants and shared configs
// =====================================================

export const CURRENCIES = [
    { code: 'NPR', symbol: 'Rs.', label: 'Nepalese Rupee', locale: 'ne-NP' },
    { code: 'USD', symbol: '$', label: 'US Dollar', locale: 'en-US' },
    { code: 'EUR', symbol: '€', label: 'Euro', locale: 'de-DE' },
    { code: 'GBP', symbol: '£', label: 'British Pound', locale: 'en-GB' },
    { code: 'INR', symbol: '₹', label: 'Indian Rupee', locale: 'en-IN' },
    { code: 'BDT', symbol: '৳', label: 'Bangladeshi Taka', locale: 'bn-BD' },
    { code: 'AED', symbol: 'AED', label: 'UAE Dirham', locale: 'ar-AE' },
    { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit', locale: 'ms-MY' },
    { code: 'PHP', symbol: '₱', label: 'Philippine Peso', locale: 'en-PH' },
    { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling', locale: 'sw-KE' },
    { code: 'NGN', symbol: '₦', label: 'Nigerian Naira', locale: 'en-NG' },
    { code: 'LKR', symbol: 'Rs', label: 'Sri Lankan Rupee', locale: 'si-LK' },
    { code: 'PKR', symbol: '₨', label: 'Pakistani Rupee', locale: 'ur-PK' },
    { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', locale: 'en-SG' },
    { code: 'ZAR', symbol: 'R', label: 'South African Rand', locale: 'en-ZA' },
];

export const DATE_FORMATS = [
    { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY (Nepal, UK, India)' },
    { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO / International)' },
];

export const AVATAR_COLORS = [
    'linear-gradient(135deg,#3b82f6,#60a5fa)',
    'linear-gradient(135deg,#a855f7,#c084fc)',
    'linear-gradient(135deg,#14b8a6,#2dd4bf)',
    'linear-gradient(135deg,#f59e0b,#fbbf24)',
    'linear-gradient(135deg,#ef4444,#f87171)',
    'linear-gradient(135deg,#22c55e,#4ade80)',
];

export const DEFAULT_BUSINESS = {
    name: 'My New Business',
    taxId: '',
    taxLabel: 'VAT',
    taxRate: 13,
    phone: '',
    email: '',
    address: '',
    country: '',
    logo: null,
    invoicePrefix: 'INV',
    currencyCode: 'USD',
    dateFormat: 'DD/MM/YYYY',
    invoiceColor: '#2563eb',
};
