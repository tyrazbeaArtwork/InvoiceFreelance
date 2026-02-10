
import React from 'react';
import FloatingLabelInput from './FloatingLabelInput';
import { Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatCurrency, getCurrencySymbol } from '../utils/formatCurrency.js';

const ItemDetails = ({ items, handleItemChange, addItem, removeItem, currencyCode: propCurrencyCode }) => {
  let currencyCode = propCurrencyCode;
  if (!currencyCode) {
    console.warn("Warning: currencyCode prop not provided to ItemDetails. Defaulting to 'MYR'.");
    currencyCode = 'MYR';
  }
  const currencySymbol = getCurrencySymbol(currencyCode);

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Services & Items</h2>
      {items.map((item, index) => (
        <div key={index} className="mb-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
            <FloatingLabelInput
              id={`itemName${index}`}
              label="Service/Item Name"
              value={item.name}
              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
              placeholder="e.g., Logo Design, Web Development"
            />
            <FloatingLabelInput
              id={`itemQuantity${index}`}
              label="Quantity/Hours"
              type="number"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
              placeholder="1"
              step="0.25"
              min="0"
            />
            <FloatingLabelInput
              id={`itemAmount${index}`}
              label={`Rate (${currencySymbol})`}
              type="number"
              value={item.amount}
              onChange={(e) => handleItemChange(index, 'amount', parseFloat(e.target.value))}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            <FloatingLabelInput
              id={`itemTotal${index}`}
              label={`Total (${currencySymbol})`}
              type="number"
              value={(item.quantity * item.amount).toFixed(2)}
              disabled
              className="bg-gray-50"
            />
          </div>
          <FloatingLabelInput
            id={`itemDescription${index}`}
            label="Service Description"
            value={item.description}
            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
            placeholder="Detailed description of the service provided"
          />
          {index > 0 && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-0 right-0 mt-2"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button type="button" onClick={addItem} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Add Service/Item
      </Button>
    </div>
  );
};

export default ItemDetails;
