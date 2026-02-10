
import React from 'react';
import { format } from 'date-fns';
import BaseTemplate2 from './BaseTemplate2';
import { calculateSubTotal, calculateTaxAmount, calculateGrandTotal } from '../../utils/invoiceCalculations';
import { formatCurrency } from '../../utils/formatCurrency';

const Receipt1 = ({ data, isPrint = false }) => {
  const { billTo = {}, invoice = {}, yourCompany = {}, cashier = '', items = [], taxPercentage = 0, notes = '', footer = '', selectedCurrency } = data || {};

  const subTotal = calculateSubTotal(items);
  const taxAmount = calculateTaxAmount(subTotal, taxPercentage);
  const total = calculateGrandTotal(subTotal, taxAmount);

  return (
    <BaseTemplate2
      width="80mm"
      height="auto"
      className="p-4"
      data={data}
      isPrint={isPrint}
    >
      <div
        className="bg-white font-inter font-bold"
        style={{
          fontSize: isPrint ? "10px" : "12px",
          lineHeight: "1.4",
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-black mb-2">RECEIPT</h1>
          <div className="text-sm font-semibold">
            <div className="font-bold text-base">{yourCompany.name || "Your Company Name"}</div>
            <div className="text-xs font-medium mt-1">{yourCompany.address || "123 Your Street"}</div>
            {yourCompany.phone && <div className="text-xs font-medium">{yourCompany.phone}</div>}
          </div>
        </div>

        {/* Invoice Info */}
        <div className="mb-4 text-sm">
          <div className="flex justify-between mb-1">
            <span className="font-semibold">INVOICE NUMBER</span>
            <span className="font-bold">{invoice.number || "00001"}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-semibold">DATE OF ISSUE</span>
            <span className="font-bold">
              {invoice.date
                ? format(new Date(invoice.date), "MM/dd/yyyy")
                : "mm/dd/yyyy"}
            </span>
          </div>
        </div>

        {/* Billed To */}
        <div className="mb-4">
          <div className="font-semibold text-sm mb-2">BILLED TO</div>
          <div className="text-sm font-medium">{billTo || "Client Name"}</div>
          <div className="text-xs font-medium">Cashier: {cashier || "N/A"}</div>
        </div>

        {/* Items Table */}
        <div className="mb-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 font-bold">DESCRIPTION</th>
                <th className="text-center py-2 font-bold">UNIT COST</th>
                <th className="text-center py-2 font-bold">QTY</th>
                <th className="text-right py-2 font-bold">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const itemQuantity = Number(item.quantity) || 0;
                const itemAmount = Number(item.amount) || 0;
                const itemTotal = itemQuantity * itemAmount;
                
                return (
                  <tr 
                    key={index} 
                    className={`${index % 2 === 0 ? 'bg-yellow-50' : 'bg-white'} border-b border-gray-200`}
                  >
                    <td className="py-2 font-medium">{item.name || "Your item name"}</td>
                    <td className="text-center py-2 font-semibold">{formatCurrency(itemAmount, selectedCurrency)}</td>
                    <td className="text-center py-2 font-semibold">{itemQuantity}</td>
                    <td className="text-right py-2 font-bold">{formatCurrency(itemTotal, selectedCurrency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t-2 border-black pt-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold">SUBTOTAL</span>
            <span className="font-bold">{formatCurrency(subTotal, selectedCurrency)}</span>
          </div>
          {taxPercentage > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold">TAX ({taxPercentage}%)</span>
              <span className="font-bold">{formatCurrency(taxAmount, selectedCurrency)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-black mt-2 pt-2 border-t border-gray-400">
            <span>TOTAL</span>
            <span className="text-blue-600">{formatCurrency(total, selectedCurrency)}</span>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mt-4 pt-3 border-t border-gray-300">
            <div className="font-semibold text-sm mb-1">TERMS</div>
            <div className="text-xs font-medium">{notes}</div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-xs font-medium text-gray-600">
          {footer || "Thank you for your business!"}
        </div>
      </div>
    </BaseTemplate2>
  );
};

export default Receipt1;
