import React from 'react';
import BaseTemplate from './BaseTemplate';
import { formatCurrency } from '../../utils/formatCurrency';

const Template8 = ({ data }) => {
  const { billTo, shipTo, invoice, yourCompany, items, taxPercentage, taxAmount, subTotal, grandTotal, notes, selectedCurrency, logo } = data;

  return (
    <BaseTemplate data={data}>
      <div
        className="bg-gray-100 w-full h-full flex flex-col"
        style={{ margin: "0", padding: "16px" }}
      >
        <div className="flex justify-between items-center mb-6">
          {logo && (
            <div className="w-20 h-20">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          )}
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-widest">Invoice</h1>
            <p className="text-sm font-semibold">{yourCompany.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Billed to</h3>
            <p className="font-bold">{billTo.name}</p>
            <p>{billTo.address}</p>
            <p>{billTo.phone}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Invoice Details</h3>
            <p>
              <span className="font-semibold">Invoice #:</span> {invoice.number}
            </p>
            <p>
              <span className="font-semibold">Invoice Date:</span>{" "}
              {invoice.date}
            </p>
            <p>
              <span className="font-semibold">Due Date:</span>{" "}
              {invoice.paymentDate}
            </p>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead style={{ backgroundColor: "#3C8BF6", color: "white" }}>
            <tr>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-right">Quantity</th>
              <th className="p-2 text-right">Rate</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-right">{item.quantity}</td>
                <td className="p-2 text-right">
                  {formatCurrency(item.amount, selectedCurrency)}
                </td>
                <td className="p-2 text-right">
                  {formatCurrency(item.quantity * item.amount, selectedCurrency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-1/2">
            <div className="flex justify-between mb-2">
              <span>Sub Total:</span>
              <span>{formatCurrency(subTotal, selectedCurrency)}</span>
            </div>
            {taxPercentage > 0 && (
              <div className="flex justify-between mb-2">
                <span>Tax ({taxPercentage}%):</span>
                <span>{formatCurrency(taxAmount, selectedCurrency)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total Due:</span>
              <span style={{ color: "#3C8BF6" }}>
                {formatCurrency(grandTotal, selectedCurrency)}
              </span>
            </div>
          </div>
        </div>

        {notes && (
          <div className="mt-8 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Notes:</h3>
            <p>{notes}</p>
          </div>
        )}
        <footer className="mt-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold" style={{ color: "#3C8BF6" }}>
              Invoice
            </h1>
            <div className="text-right">
              <h2 className="text-xl font-bold">{yourCompany.name}</h2>
              <p>{yourCompany.address}</p>
              <p>{yourCompany.phone}</p>
            </div>
          </div>
        </footer>
      </div>
    </BaseTemplate>
  );
};

export default Template8;
