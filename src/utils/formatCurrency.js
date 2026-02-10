
export const formatCurrency = (amount, currencyCode = 'MYR', minimumFractionDigits = 2) => {
  const localeMap = {
    // Southeast Asia
    'MYR': 'ms-MY',     // Malaysia Ringgit
    'SGD': 'en-SG',     // Singapore Dollar
    'THB': 'th-TH',     // Thai Baht
    'IDR': 'id-ID',     // Indonesian Rupiah
    'PHP': 'en-PH',     // Philippine Peso
    'VND': 'vi-VN',     // Vietnamese Dong
    'BND': 'ms-BN',     // Brunei Dollar
    'KHR': 'km-KH',     // Cambodian Riel
    'LAK': 'lo-LA',     // Lao Kip
    'MMK': 'my-MM',     // Myanmar Kyat
    
    // Australia & Oceania
    'AUD': 'en-AU',     // Australian Dollar
    'NZD': 'en-NZ',     // New Zealand Dollar
    'FJD': 'en-FJ',     // Fijian Dollar
    'PGK': 'en-PG',     // Papua New Guinea Kina
    'WST': 'en-WS',     // Samoan Tala
    'TOP': 'to-TO',     // Tongan Pa'anga
    'VUV': 'bi-VU',     // Vanuatu Vatu
    
    // Major Global Currencies
    'USD': 'en-US',     // US Dollar
    'EUR': 'de-DE',     // Euro
    'GBP': 'en-GB',     // British Pound
    'JPY': 'ja-JP',     // Japanese Yen
    'CNY': 'zh-CN',     // Chinese Yuan
    'KRW': 'ko-KR',     // South Korean Won
    'INR': 'en-IN',     // Indian Rupee
    'HKD': 'en-HK',     // Hong Kong Dollar
    'TWD': 'zh-TW',     // Taiwan Dollar
    'CAD': 'en-CA',     // Canadian Dollar
    'CHF': 'de-CH',     // Swiss Franc
    'SEK': 'sv-SE',     // Swedish Krona
    'NOK': 'nb-NO',     // Norwegian Krone
    'DKK': 'da-DK',     // Danish Krone
    'RUB': 'ru-RU',     // Russian Ruble
    'BRL': 'pt-BR',     // Brazilian Real
    'MXN': 'es-MX',     // Mexican Peso
    'ZAR': 'en-ZA',     // South African Rand
    'TRY': 'tr-TR',     // Turkish Lira
    'SAR': 'ar-SA',     // Saudi Riyal
    'AED': 'ar-AE',     // UAE Dirham
    'QAR': 'ar-QA',     // Qatari Riyal
    'KWD': 'ar-KW',     // Kuwaiti Dinar
    'BHD': 'ar-BH',     // Bahraini Dinar
    'OMR': 'ar-OM',     // Omani Rial
    'JOD': 'ar-JO',     // Jordanian Dinar
    'LBP': 'ar-LB',     // Lebanese Pound
    'EGP': 'ar-EG',     // Egyptian Pound
    'ILS': 'he-IL',     // Israeli Shekel
    'IRR': 'fa-IR',     // Iranian Rial
    'PKR': 'ur-PK',     // Pakistani Rupee
    'BDT': 'bn-BD',     // Bangladeshi Taka
    'LKR': 'si-LK',     // Sri Lankan Rupee
    'NPR': 'ne-NP',     // Nepalese Rupee
    'BTN': 'dz-BT',     // Bhutanese Ngultrum
    'AFN': 'fa-AF',     // Afghan Afghani
    'UZS': 'uz-UZ',     // Uzbekistani Som
    'KZT': 'kk-KZ',     // Kazakhstani Tenge
    'KGS': 'ky-KG',     // Kyrgyzstani Som
    'TJS': 'tg-TJ',     // Tajikistani Somoni
    'TMT': 'tk-TM',     // Turkmenistani Manat
    'MNT': 'mn-MN',     // Mongolian Tugrik
  };
  
  const locale = localeMap[currencyCode] || 'en-US';
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency: currencyCode, 
    minimumFractionDigits 
  }).format(amount);
};

export const getCurrencySymbol = (currencyCode) => {
  return formatCurrency(0, currencyCode).replace(/[\d.,\s]/g, '');
};

export const getCurrencyOptions = () => [
  // Southeast Asia (Priority)
  { value: 'MYR', label: 'MYR (RM) - Malaysian Ringgit', symbol: 'RM', region: 'Southeast Asia' },
  { value: 'SGD', label: 'SGD (S$) - Singapore Dollar', symbol: 'S$', region: 'Southeast Asia' },
  { value: 'THB', label: 'THB (฿) - Thai Baht', symbol: '฿', region: 'Southeast Asia' },
  { value: 'IDR', label: 'IDR (Rp) - Indonesian Rupiah', symbol: 'Rp', region: 'Southeast Asia' },
  { value: 'PHP', label: 'PHP (₱) - Philippine Peso', symbol: '₱', region: 'Southeast Asia' },
  { value: 'VND', label: 'VND (₫) - Vietnamese Dong', symbol: '₫', region: 'Southeast Asia' },
  { value: 'BND', label: 'BND (B$) - Brunei Dollar', symbol: 'B$', region: 'Southeast Asia' },
  { value: 'KHR', label: 'KHR (៛) - Cambodian Riel', symbol: '៛', region: 'Southeast Asia' },
  { value: 'LAK', label: 'LAK (₭) - Lao Kip', symbol: '₭', region: 'Southeast Asia' },
  { value: 'MMK', label: 'MMK (K) - Myanmar Kyat', symbol: 'K', region: 'Southeast Asia' },
  
  // Australia & Oceania (Priority)
  { value: 'AUD', label: 'AUD (A$) - Australian Dollar', symbol: 'A$', region: 'Oceania' },
  { value: 'NZD', label: 'NZD (NZ$) - New Zealand Dollar', symbol: 'NZ$', region: 'Oceania' },
  { value: 'FJD', label: 'FJD (FJ$) - Fijian Dollar', symbol: 'FJ$', region: 'Oceania' },
  { value: 'PGK', label: 'PGK (K) - Papua New Guinea Kina', symbol: 'K', region: 'Oceania' },
  { value: 'WST', label: 'WST (WS$) - Samoan Tala', symbol: 'WS$', region: 'Oceania' },
  { value: 'TOP', label: 'TOP (T$) - Tongan Pa\'anga', symbol: 'T$', region: 'Oceania' },
  { value: 'VUV', label: 'VUV (VT) - Vanuatu Vatu', symbol: 'VT', region: 'Oceania' },
  
  // Major Global Currencies
  { value: 'USD', label: 'USD ($) - US Dollar', symbol: '$', region: 'Americas' },
  { value: 'EUR', label: 'EUR (€) - Euro', symbol: '€', region: 'Europe' },
  { value: 'GBP', label: 'GBP (£) - British Pound', symbol: '£', region: 'Europe' },
  { value: 'JPY', label: 'JPY (¥) - Japanese Yen', symbol: '¥', region: 'Asia' },
  { value: 'CNY', label: 'CNY (¥) - Chinese Yuan', symbol: '¥', region: 'Asia' },
  { value: 'KRW', label: 'KRW (₩) - South Korean Won', symbol: '₩', region: 'Asia' },
  { value: 'INR', label: 'INR (₹) - Indian Rupee', symbol: '₹', region: 'Asia' },
  { value: 'HKD', label: 'HKD (HK$) - Hong Kong Dollar', symbol: 'HK$', region: 'Asia' },
  { value: 'TWD', label: 'TWD (NT$) - Taiwan Dollar', symbol: 'NT$', region: 'Asia' },
  { value: 'CAD', label: 'CAD (C$) - Canadian Dollar', symbol: 'C$', region: 'Americas' },
  { value: 'CHF', label: 'CHF (CHF) - Swiss Franc', symbol: 'CHF', region: 'Europe' },
  { value: 'SEK', label: 'SEK (kr) - Swedish Krona', symbol: 'kr', region: 'Europe' },
  { value: 'NOK', label: 'NOK (kr) - Norwegian Krone', symbol: 'kr', region: 'Europe' },
  { value: 'DKK', label: 'DKK (kr) - Danish Krone', symbol: 'kr', region: 'Europe' },
  { value: 'RUB', label: 'RUB (₽) - Russian Ruble', symbol: '₽', region: 'Europe/Asia' },
  { value: 'BRL', label: 'BRL (R$) - Brazilian Real', symbol: 'R$', region: 'Americas' },
  { value: 'MXN', label: 'MXN ($) - Mexican Peso', symbol: '$', region: 'Americas' },
  { value: 'ZAR', label: 'ZAR (R) - South African Rand', symbol: 'R', region: 'Africa' },
  { value: 'TRY', label: 'TRY (₺) - Turkish Lira', symbol: '₺', region: 'Europe/Asia' },
  
  // Middle East
  { value: 'SAR', label: 'SAR (﷼) - Saudi Riyal', symbol: '﷼', region: 'Middle East' },
  { value: 'AED', label: 'AED (د.إ) - UAE Dirham', symbol: 'د.إ', region: 'Middle East' },
  { value: 'QAR', label: 'QAR (﷼) - Qatari Riyal', symbol: '﷼', region: 'Middle East' },
  { value: 'KWD', label: 'KWD (د.ك) - Kuwaiti Dinar', symbol: 'د.ك', region: 'Middle East' },
  { value: 'BHD', label: 'BHD (.د.ب) - Bahraini Dinar', symbol: '.د.ب', region: 'Middle East' },
  { value: 'OMR', label: 'OMR (﷼) - Omani Rial', symbol: '﷼', region: 'Middle East' },
  { value: 'JOD', label: 'JOD (د.ا) - Jordanian Dinar', symbol: 'د.ا', region: 'Middle East' },
  { value: 'LBP', label: 'LBP (ل.ل) - Lebanese Pound', symbol: 'ل.ل', region: 'Middle East' },
  { value: 'EGP', label: 'EGP (£) - Egyptian Pound', symbol: '£', region: 'Middle East/Africa' },
  { value: 'ILS', label: 'ILS (₪) - Israeli Shekel', symbol: '₪', region: 'Middle East' },
  { value: 'IRR', label: 'IRR (﷼) - Iranian Rial', symbol: '﷼', region: 'Middle East' },
  
  // South Asia
  { value: 'PKR', label: 'PKR (₨) - Pakistani Rupee', symbol: '₨', region: 'South Asia' },
  { value: 'BDT', label: 'BDT (৳) - Bangladeshi Taka', symbol: '৳', region: 'South Asia' },
  { value: 'LKR', label: 'LKR (₨) - Sri Lankan Rupee', symbol: '₨', region: 'South Asia' },
  { value: 'NPR', label: 'NPR (₨) - Nepalese Rupee', symbol: '₨', region: 'South Asia' },
  { value: 'BTN', label: 'BTN (Nu.) - Bhutanese Ngultrum', symbol: 'Nu.', region: 'South Asia' },
  { value: 'AFN', label: 'AFN (؋) - Afghan Afghani', symbol: '؋', region: 'South Asia' },
  
  // Central Asia
  { value: 'UZS', label: 'UZS (лв) - Uzbekistani Som', symbol: 'лв', region: 'Central Asia' },
  { value: 'KZT', label: 'KZT (₸) - Kazakhstani Tenge', symbol: '₸', region: 'Central Asia' },
  { value: 'KGS', label: 'KGS (лв) - Kyrgyzstani Som', symbol: 'лв', region: 'Central Asia' },
  { value: 'TJS', label: 'TJS (SM) - Tajikistani Somoni', symbol: 'SM', region: 'Central Asia' },
  { value: 'TMT', label: 'TMT (T) - Turkmenistani Manat', symbol: 'T', region: 'Central Asia' },
  { value: 'MNT', label: 'MNT (₮) - Mongolian Tugrik', symbol: '₮', region: 'East Asia' },
];
