
import React from 'react';
import BaseTemplate from './BaseTemplate';
import { formatCurrency } from '../../utils/formatCurrency';

const Template10 = ({ data }) => {
  const { billTo, shipTo, invoice, yourCompany, items, taxPercentage, taxAmount, subTotal, grandTotal, notes, selectedCurrency } = data;

  return (
    <BaseTemplate data={data}>
      <div className="bg-white p-8 max-w-4xl mx-auto h-full">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">P:</span> {yourCompany.phone}</p>
            <p><span className="font-medium">E:</span> example@company.com</p>
            <p><span className="font-medium">A:</span> {yourCompany.address}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end mb-2">
              <div className="w-8 h-8 bg-black transform rotate-45 mr-3"></div>
              <div>
                <h2 className="text-lg font-bold uppercase">Company Name</h2>
                <p className="text-xs text-gray-600">your tagline here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Title and Number */}
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-1">Invoice No: #{invoice.number}</p>
          <h1 className="text-6xl font-bold text-blue-900 mb-4">INVOICE</h1>
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        {/* Client Info and Balance Due */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-sm text-gray-600 mb-2">To</p>
            <h3 className="text-xl font-bold text-blue-900 mb-2">{billTo.name}</h3>
            <p className="text-sm text-gray-600 mb-1">Director</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="font-medium">P</span> {billTo.phone}</p>
              <p><span className="font-medium">E</span> User@example.com</p>
              <p><span className="font-medium">A</span> {billTo.address}</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold mb-1">BALANCE DUE {formatCurrency(grandTotal, selectedCurrency)}</h3>
            <p className="text-sm text-gray-600">{invoice.paymentDate}</p>
            <div className="w-32 h-px bg-gray-300 ml-auto mt-4 mb-4"></div>
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="font-medium">Invoice Date :</span> {invoice.date}</p>
              <p><span className="font-medium">Issue Date :</span> {invoice.date}</p>
              <p><span className="font-medium">Account no :</span> {invoice.number}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-3 text-left text-sm font-medium">SL</th>
                <th className="p-3 text-left text-sm font-medium">Item Description</th>
                <th className="p-3 text-center text-sm font-medium">Rate</th>
                <th className="p-3 text-center text-sm font-medium">Qty</th>
                <th className="p-3 text-right text-sm font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="p-3 text-sm">{String(index + 1).padStart(2, '0')}</td>
                  <td className="p-3">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.description || 'Lorem Ipsum is simply dummy text of the printing'}</p>
                  </td>
                  <td className="p-3 text-center text-sm">{formatCurrency(item.amount, selectedCurrency)}</td>
                  <td className="p-3 text-center text-sm">{String(item.quantity).padStart(2, '0')}</td>
                  <td className="p-3 text-right text-sm font-medium">{formatCurrency(item.total, selectedCurrency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subTotal, selectedCurrency)}</span>
              </div>
              {taxPercentage > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({taxPercentage}%):</span>
                  <span>{formatCurrency(taxAmount, selectedCurrency)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-base">
                  <span>Total:</span>
                  <span>{formatCurrency(grandTotal, selectedCurrency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-2">Notes:</h4>
            <p className="text-xs text-gray-600">{notes}</p>
          </div>
        )}
      </div>
    </BaseTemplate>
  );
};

export default Template10;
