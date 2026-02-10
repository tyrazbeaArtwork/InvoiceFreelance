
import React from 'react';
import { format } from 'date-fns';
import BaseTemplate from './BaseTemplate';
import { formatCurrency } from '../../utils/formatCurrency';

const Template7 = ({ data }) => {
  const { billTo = {}, shipTo = {}, invoice = {}, yourCompany = {}, items = [], taxPercentage = 0, taxAmount = 0, subTotal = 0, grandTotal = 0, notes = '', selectedCurrency, logo } = data || {};

  return (
    <BaseTemplate data={data}>
      <div className="bg-white p-10 max-w-4xl mx-auto shadow-inner rounded-sm">
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-6">
            {logo && (
              <div className="w-24 h-24 bg-white border-4 border-gray-50 flex items-center justify-center shadow-lg rounded-2xl overflow-hidden p-2">
                <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight mb-2 italic">TAX INVOICE</h1>
              <div className="flex gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span>#{invoice.number || "N/A"}</span>
                <span className="text-gray-300">|</span>
                <span>{invoice.date ? format(new Date(invoice.date), "dd MMM yyyy") : "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="text-right border-r-8 border-blue-600 pr-6 py-2">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {yourCompany.name || "Your Company"}
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">{yourCompany.address}</p>
            <p className="text-sm text-gray-400">{yourCompany.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-16 mb-16 px-4">
          <div className="border-l-2 border-gray-100 pl-6">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Recipient</h3>
            <div className="space-y-1">
              <p className="font-bold text-gray-900 text-lg">{billTo.name}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{billTo.address}</p>
              {billTo.phone && <p className="text-gray-400 text-xs mt-2 italic">{billTo.phone}</p>}
            </div>
          </div>
          <div className="border-l-2 border-gray-100 pl-6">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Reference</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Due Date:</span>
                <span className="font-bold text-gray-800">{invoice.paymentDate ? format(new Date(invoice.paymentDate), "dd MMM yyyy") : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Currency:</span>
                <span className="font-bold text-gray-800 uppercase tracking-tighter">{selectedCurrency}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 mb-12">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 text-white text-left">
                <th className="py-5 px-6 font-bold uppercase text-[10px] tracking-[0.2em] border-r border-gray-800">Item Description</th>
                <th className="py-5 px-6 font-bold uppercase text-[10px] tracking-[0.2em] text-center border-r border-gray-800">Quantity</th>
                <th className="py-5 px-6 font-bold uppercase text-[10px] tracking-[0.2em] text-right border-r border-gray-800">Unit Price</th>
                <th className="py-5 px-6 font-bold uppercase text-[10px] tracking-[0.2em] text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {items.map((item, index) => (
                <tr key={index} className="group">
                  <td className="py-6 px-6 group-hover:bg-gray-50 transition-colors">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    {item.description && <p className="text-xs text-gray-400 mt-2 font-medium">{item.description}</p>}
                  </td>
                  <td className="py-6 px-6 text-center text-gray-600 font-medium group-hover:bg-gray-50">{item.quantity}</td>
                  <td className="py-6 px-6 text-right text-gray-600 font-medium group-hover:bg-gray-50">{formatCurrency(item.amount, selectedCurrency)}</td>
                  <td className="py-6 px-6 text-right font-black text-gray-900 group-hover:bg-gray-50">
                    {formatCurrency((item.quantity || 0) * (item.amount || 0), selectedCurrency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pr-6">
          <div className="w-full max-w-xs space-y-4">
            <div className="flex justify-between text-sm text-gray-400 px-2">
              <span>Subtotal</span>
              <span className="font-bold text-gray-800">{formatCurrency(subTotal, selectedCurrency)}</span>
            </div>
            {taxPercentage > 0 && (
              <div className="flex justify-between text-sm text-gray-400 px-2 pb-2 border-b border-gray-100">
                <span>SST ({taxPercentage}%)</span>
                <span className="font-bold text-gray-800">{formatCurrency(taxAmount, selectedCurrency)}</span>
              </div>
            )}
            <div className="bg-blue-800 p-6 rounded-2xl shadow-xl shadow-blue-100 transform rotate-[-1deg]">
              <div className="flex justify-between items-center text-white">
                <span className="text-xs font-bold uppercase tracking-widest opacity-70">Payable Total</span>
                <span className="text-3xl font-black">
                  {formatCurrency(grandTotal, selectedCurrency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {notes && (
          <div className="mt-20 pt-8 border-t-2 border-dashed border-gray-100 italic text-gray-400 text-sm text-center max-w-2xl mx-auto">
            {notes}
          </div>
        )}
      </div>
    </BaseTemplate>
  );
};

export default Template7;
