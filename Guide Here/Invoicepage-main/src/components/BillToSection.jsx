
import React from 'react';
import FloatingLabelInput from './FloatingLabelInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getCurrencyOptions } from '../utils/formatCurrency';

const BillToSection = ({ billTo, handleInputChange, selectedCurrency, setSelectedCurrency }) => {
  const currencyOptions = getCurrencyOptions();

  return (
    <div className="mb-6">
      <div className="mb-4">
        <Label htmlFor="currency-select" className="text-lg font-medium mb-2 block">Select Currency</Label>
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-full" id="currency-select">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            {currencyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="cursor-pointer hover:bg-gray-100">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Bill To</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingLabelInput
          id="billToName"
          label="Client Name"
          value={billTo.name}
          onChange={handleInputChange}
          name="name"
          placeholder="Enter client name"
        />
        <FloatingLabelInput
          id="billToPhone"
          label="Phone"
          value={billTo.phone}
          onChange={handleInputChange}
          name="phone"
          placeholder="Enter phone number"
        />
      </div>
      <FloatingLabelInput
        id="billToAddress"
        label="Client Address"
        value={billTo.address}
        onChange={handleInputChange}
        name="address"
        className="mt-4"
        placeholder="Enter client address"
      />
    </div>
  );
};

export default BillToSection;
