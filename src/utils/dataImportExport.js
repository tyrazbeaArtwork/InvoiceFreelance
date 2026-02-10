
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (formData) => {
  const workbook = XLSX.utils.book_new();

  // Check if this is invoice data (has billTo as object) or receipt data (has billTo as string)
  const isInvoiceData = formData.billTo && typeof formData.billTo === 'object';

  // Create company info sheet
  const companyData = [
    ['Field', 'Value'],
    ['Business Name', formData.yourCompany?.name || ''],
    ['Business Address', formData.yourCompany?.address || ''],
    ['Business Phone', formData.yourCompany?.phone || ''],
    ['Bill To Name', isInvoiceData ? formData.billTo?.name || '' : formData.billTo || ''],
    ['Bill To Address', isInvoiceData ? formData.billTo?.address || '' : ''],
    ['Bill To Phone', isInvoiceData ? formData.billTo?.phone || '' : ''],
    ['Ship To Name', formData.shipTo?.name || ''],
    ['Ship To Address', formData.shipTo?.address || ''],
    ['Ship To Phone', formData.shipTo?.phone || ''],
    ['Invoice Number', formData.invoice?.number || ''],
    ['Invoice Date', formData.invoice?.date || ''],
    ['Due Date', formData.invoice?.paymentDate || ''],
    ['Currency', formData.selectedCurrency || 'MYR'],
    ['Tax Percentage', formData.taxPercentage || 0],
    ['Notes', formData.notes || ''],
    ['GST Number', formData.yourCompany?.gst || ''],
    ['Cashier', formData.cashier || ''],
    ['Footer', formData.footer || '']
  ];

  const companySheet = XLSX.utils.aoa_to_sheet(companyData);
  XLSX.utils.book_append_sheet(workbook, companySheet, 'Invoice Info');

  // Create items sheet
  const itemsData = [
    ['Item Name', 'Description', 'Quantity', 'Amount', 'Total']
  ];

  if (formData.items && formData.items.length > 0) {
    formData.items.forEach(item => {
      itemsData.push([
        item.name || '',
        item.description || '',
        item.quantity || 0,
        item.amount || 0,
        item.total || 0
      ]);
    });
  }

  const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
  XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Items');

  // Generate filename with timestamp
  const timestamp = new Date().getTime();
  const fileName = `invoice_data_${timestamp}.xlsx`;

  // Save the file
  XLSX.writeFile(workbook, fileName);
};

export const importFromExcel = (file, isReceiptPage = false) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Helper to find sheet name case-insensitive
        const findSheetName = (name) => workbook.SheetNames.find(n => n.trim().toLowerCase() === name.toLowerCase());

        // Try to read 'Invoice Info' or first sheet
        const sheetName = findSheetName('Invoice Info') || workbook.SheetNames[0];
        const invoiceSheet = workbook.Sheets[sheetName];
        const invoiceData = XLSX.utils.sheet_to_json(invoiceSheet, { header: 1 });

        // Read items from 'Items' or second sheet if it exists
        const itemsSheetName = findSheetName('Items') || (workbook.SheetNames.length > 1 ? workbook.SheetNames[1] : null);
        const itemsData = itemsSheetName ? XLSX.utils.sheet_to_json(workbook.Sheets[itemsSheetName], { header: 1 }) : [];

        // Parse invoice data with fuzzy matching
        const formData = {
          yourCompany: {
            name: findInSheet(invoiceData, ['Business Name', 'Company Name', 'From']),
            address: findInSheet(invoiceData, ['Business Address', 'Company Address', 'Address']),
            phone: findInSheet(invoiceData, ['Business Phone', 'Phone']),
            gst: findInSheet(invoiceData, ['GST Number', 'GSTIN', 'Tax ID'])
          },
          invoice: {
            number: findInSheet(invoiceData, ['Invoice Number', 'Number', 'ID']),
            date: findInSheet(invoiceData, ['Invoice Date', 'Date']),
            paymentDate: findInSheet(invoiceData, ['Due Date', 'Payment Date'])
          },
          selectedCurrency: findInSheet(invoiceData, ['Currency', 'Symbol']) || 'MYR',
          taxPercentage: parseFloat(findInSheet(invoiceData, ['Tax Percentage', 'Tax Rate'])) || 0,
          notes: findInSheet(invoiceData, ['Notes', 'Comments']),
          cashier: findInSheet(invoiceData, ['Cashier', 'User']),
          footer: findInSheet(invoiceData, ['Footer', 'Signature'])
        };

        if (isReceiptPage) {
          formData.billTo = findInSheet(invoiceData, ['Bill To Name', 'Customer Base', 'Bill To']);
        } else {
          formData.billTo = {
            name: findInSheet(invoiceData, ['Bill To Name', 'Customer']),
            address: findInSheet(invoiceData, ['Bill To Address', 'Customer Address']),
            phone: findInSheet(invoiceData, ['Bill To Phone', 'Customer Phone'])
          };
          formData.shipTo = {
            name: findInSheet(invoiceData, ['Ship To Name', 'Ship To']),
            address: findInSheet(invoiceData, ['Ship To Address']),
            phone: findInSheet(invoiceData, ['Ship To Phone'])
          };
        }

        const items = [];
        // Strict header detection: Check only the first cell for "Item", "Service", "Description"
        const isHeaderRow = (row) => {
          if (!row || !Array.isArray(row) || row.length === 0) return false;
          const firstCell = row[0]?.toString().toLowerCase() || '';
          return firstCell.includes('item') || firstCell.includes('service') || firstCell.includes('description');
        };

        // If row 0 looks like a header, start from 1. Otherwise start from 0.
        const itemsStartIndex = isHeaderRow(itemsData[0]) ? 1 : 0;

        for (let i = itemsStartIndex; i < itemsData.length; i++) {
          const row = itemsData[i];
          if (row && row.length > 0 && (row[0] || row[1])) {
            items.push({
              name: row[0] || '',
              description: row[1] || '',
              quantity: parseFloat(row[2]) || 0,
              amount: parseFloat(row[3]) || 0,
              total: parseFloat(row[4]) || 0
            });
          }
        }

        formData.items = items.length > 0 ? items : [{ name: '', description: '', quantity: 0, amount: 0, total: 0 }];
        resolve(formData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

const findInSheet = (data, aliases) => {
  if (!data || !Array.isArray(data)) return '';
  for (const alias of aliases) {
    const searchAlias = alias.trim().toLowerCase();
    // Search in first and second columns to handle different layouts
    const row = data.find(row => {
      if (!row || !Array.isArray(row)) return false;
      const col0 = row[0]?.toString().trim().toLowerCase() || '';
      return col0 === searchAlias || col0.includes(searchAlias);
    });
    if (row && row.length > 1) return row[1];
  }
  return '';
};

export const exportToPDF = async (invoiceElement) => {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [canvas.width * 0.264583, canvas.height * 0.264583],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.264583, canvas.height * 0.264583);

    const timestamp = new Date().getTime();
    const fileName = `Invoice_${timestamp}.pdf`;

    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
