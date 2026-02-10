
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const filePath = 'C:\\Users\\Tyra\\Downloads\\Invoicepage-main\\Guide Here\\Format import export\\invoice_data_1stdev.xlsx';

const findInSheet = (data, aliases) => {
    if (!data || !Array.isArray(data)) return '';
    for (const alias of aliases) {
        const searchAlias = alias.trim().toLowerCase();
        const row = data.find(row => {
            if (!row || !Array.isArray(row)) return false;
            const col0 = row[0]?.toString().trim().toLowerCase() || '';
            return col0 === searchAlias || col0.includes(searchAlias);
        });
        if (row && row.length > 1) return row[1];
    }
    return '';
};

try {
    const buf = fs.readFileSync(filePath);
    const workbook = XLSX.read(buf, { type: 'buffer' });

    console.log('SheetNames:', workbook.SheetNames);

    const invoiceSheetName = workbook.SheetNames.includes('Invoice Info') ? 'Invoice Info' : workbook.SheetNames[0];
    const invoiceSheet = workbook.Sheets[invoiceSheetName];
    const invoiceData = XLSX.utils.sheet_to_json(invoiceSheet, { header: 1 });

    console.log('Invoice Data Rows:', invoiceData.length);
    if (invoiceData.length > 0) console.log('Row 0:', invoiceData[0]);
    if (invoiceData.length > 4) console.log('Row 4 (Bill To):', invoiceData[4]);
    if (invoiceData.length > 16) console.log('Row 16 (GST):', invoiceData[16]);

    const yourCompany = {
        name: findInSheet(invoiceData, ['Business Name', 'Company Name', 'From']),
        gst: findInSheet(invoiceData, ['GST Number', 'GSTIN', 'Tax ID'])
    };

    console.log('Extracted yourCompany:', yourCompany);

    const billTo = {
        name: findInSheet(invoiceData, ['Bill To Name', 'Customer']),
    };
    console.log('Extracted billTo:', billTo);

    const itemsSheetName = workbook.SheetNames.includes('Items') ? 'Items' : (workbook.SheetNames[1] || null);
    const itemsData = itemsSheetName ? XLSX.utils.sheet_to_json(workbook.Sheets[itemsSheetName], { header: 1 }) : [];

    console.log('Items Data Rows:', itemsData.length);
    // Print first 5 rows
    itemsData.slice(0, 5).forEach((row, i) => console.log(`Item Row ${i}:`, row));

    const isHeaderRow = (row) => {
        if (!row || !Array.isArray(row)) return false;
        return row.some(cell => {
            const val = cell?.toString().toLowerCase() || '';
            return val.includes('item') || val.includes('description') || val.includes('quantity') || val.includes('amount') || val.includes('price');
        });
    };

    const itemsStartIndex = isHeaderRow(itemsData[0]) ? 1 : 0;
    console.log('Items Start Index:', itemsStartIndex);

    const items = [];
    for (let i = itemsStartIndex; i < itemsData.length; i++) {
        const row = itemsData[i];
        if (row && row.length > 0 && (row[0] || row[1])) {
            items.push({
                name: row[0] || '',
                amount: parseFloat(row[3]) || 0
            });
        }
    }
    console.log('Extracted Items:', items);

} catch (e) {
    console.error(e);
}
