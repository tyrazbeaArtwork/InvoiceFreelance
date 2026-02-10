
import React from 'react';
import { format } from 'date-fns';
import BaseTemplate from './BaseTemplate';
import { formatCurrency } from '../../utils/formatCurrency';

const Template4 = ({ data }) => {
  const { billTo = {}, shipTo = {}, invoice = {}, yourCompany = {}, items = [], taxPercentage = 0, taxAmount = 0, subTotal = 0, grandTotal = 0, notes = '', selectedCurrency, logo } = data || {};

  return (
    <BaseTemplate data={data}>
      <div className="bg-white p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-100">
          <div className="flex items-start gap-5">
            {logo && (
              <div className="w-24 h-24 bg-gray-50 p-2 rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <div>
              <h1 className="text-5xl font-black text-purple-700 tracking-tighter mb-4">INVOICE</h1>
              <div className="space-y-1 text-sm text-gray-500">
                <p><span className="font-bold text-gray-700">No.</span> {invoice.number || "N/A"}</p>
                <p>
                  <span className="font-bold text-gray-700">Date:</span>{" "}
                  {invoice.date ? format(new Date(invoice.date), "MMM dd, yyyy") : "N/A"}
                </p>
                <p>
                  <span className="font-bold text-gray-700">Due:</span>{" "}
                  {invoice.paymentDate ? format(new Date(invoice.paymentDate), "MMM dd, yyyy") : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {yourCompany.name || "Your Company"}
            </h2>
            <div className="text-sm text-gray-500 space-y-0.5">
              <p>{yourCompany.address}</p>
              <p>{yourCompany.phone}</p>
              <p>{yourCompany.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3">Bill To</h3>
            <div className="text-gray-900">
              <p className="font-bold text-lg">{billTo.name}</p>
              <p className="text-gray-600">{billTo.address}</p>
              <p className="text-gray-600">{billTo.phone}</p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3">Ship To</h3>
            <div className="text-gray-900">
              <p className="font-bold text-lg">{shipTo.name || billTo.name}</p>
              <p className="text-gray-600">{shipTo.address || billTo.address}</p>
            </div>
          </div>
        </div>

        <table className="w-full mb-12">
          <thead>
            <tr className="bg-purple-50 text-purple-700 text-left border-y border-purple-100">
              <th className="py-4 px-4 font-bold uppercase text-xs tracking-widest">Description</th>
              <th className="py-4 px-4 font-bold uppercase text-xs tracking-widest text-center">Qty</th>
              <th className="py-4 px-4 font-bold uppercase text-xs tracking-widest text-right">Rate</th>
              <th className="py-4 px-4 font-bold uppercase text-xs tracking-widest text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="py-5 px-4">
                  <p className="font-bold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                </td>
                <td className="py-5 px-4 text-center text-gray-700">{item.quantity}</td>
                <td className="py-5 px-4 text-right text-gray-700">{formatCurrency(item.amount, selectedCurrency)}</td>
                <td className="py-5 px-4 text-right font-bold text-gray-900">
                  {formatCurrency((item.quantity || 0) * (item.amount || 0), selectedCurrency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-12">
          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subTotal, selectedCurrency)}</span>
            </div>
            {taxPercentage > 0 && (
              <div className="flex justify-between text-gray-600 pb-2 border-b border-gray-100">
                <span>Tax ({taxPercentage}%)</span>
                <span>{formatCurrency(taxAmount, selectedCurrency)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold text-gray-900">Total Due</span>
              <span className="text-2xl font-black text-purple-700">
                {formatCurrency(grandTotal, selectedCurrency)}
              </span>
            </div>
          </div>
        </div>

        {notes && (
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Terms & Notes</h3>
            <p className="text-gray-600 leading-relaxed">{notes}</p>
          </div>
        )}
      </div>
    </BaseTemplate>
  );
};

export default Template4;
