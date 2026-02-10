
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
        
        // Read invoice info
        const invoiceSheet = workbook.Sheets['Invoice Info'];
        const invoiceData = XLSX.utils.sheet_to_json(invoiceSheet, { header: 1 });
        
        // Read items
        const itemsSheet = workbook.Sheets['Items'];
        const itemsData = XLSX.utils.sheet_to_json(itemsSheet, { header: 1 });
        
        // Parse invoice data
        const formData = {
          yourCompany: {
            name: getValueFromData(invoiceData, 'Business Name'),
            address: getValueFromData(invoiceData, 'Business Address'),
            phone: getValueFromData(invoiceData, 'Business Phone'),
            gst: getValueFromData(invoiceData, 'GST Number')
          },
          invoice: {
            number: getValueFromData(invoiceData, 'Invoice Number'),
            date: getValueFromData(invoiceData, 'Invoice Date'),
            paymentDate: getValueFromData(invoiceData, 'Due Date')
          },
          selectedCurrency: getValueFromData(invoiceData, 'Currency') || 'MYR',
          taxPercentage: parseFloat(getValueFromData(invoiceData, 'Tax Percentage')) || 0,
          notes: getValueFromData(invoiceData, 'Notes'),
          cashier: getValueFromData(invoiceData, 'Cashier'),
          footer: getValueFromData(invoiceData, 'Footer')
        };
        
        // Handle billTo differently based on whether this is for receipt page or invoice page
        if (isReceiptPage) {
          // For receipt page, billTo should be a string (just the name)
          formData.billTo = getValueFromData(invoiceData, 'Bill To Name');
        } else {
          // For invoice page, billTo should be an object
          formData.billTo = {
            name: getValueFromData(invoiceData, 'Bill To Name'),
            address: getValueFromData(invoiceData, 'Bill To Address'),
            phone: getValueFromData(invoiceData, 'Bill To Phone')
          };
          // Add shipTo for invoice page
          formData.shipTo = {
            name: getValueFromData(invoiceData, 'Ship To Name'),
            address: getValueFromData(invoiceData, 'Ship To Address'),
            phone: getValueFromData(invoiceData, 'Ship To Phone')
          };
        }
        
        // Parse items data
        const items = [];
        for (let i = 1; i < itemsData.length; i++) {
          const row = itemsData[i];
          if (row && row.length > 0) {
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

const getValueFromData = (data, fieldName) => {
  const row = data.find(row => row[0] === fieldName);
  return row ? row[1] : '';
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
