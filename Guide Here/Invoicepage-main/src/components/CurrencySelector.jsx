
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getCurrencyOptions } from '../utils/formatCurrency';

const CurrencySelector = ({ selectedCurrency, onCurrencyChange }) => {
  const currencyOptions = getCurrencyOptions();

  // Group currencies by region for better organization
  const groupedCurrencies = currencyOptions.reduce((acc, currency) => {
    const region = currency.region;
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(currency);
    return acc;
  }, {});

  // Define priority order for regions
  const regionOrder = [
    'Southeast Asia',
    'Oceania', 
    'Asia',
    'Americas',
    'Europe',
    'Middle East',
    'South Asia',
    'Central Asia',
    'Africa',
    'Europe/Asia',
    'Middle East/Africa'
  ];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Currency</label>
      <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {regionOrder.map(region => {
            if (!groupedCurrencies[region]) return null;
            
            return (
              <div key={region}>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                  {region}
                </div>
                {groupedCurrencies[region].map(currency => (
                  <SelectItem key={currency.value} value={currency.value}>
                    <span className="font-mono text-sm">{currency.label}</span>
                  </SelectItem>
                ))}
              </div>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencySelector;
