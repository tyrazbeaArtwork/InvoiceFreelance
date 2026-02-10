
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../utils/dataImportExport';

const ImportExportButtons = ({ formData, onImportData, isReceiptPage = false }) => {
  const handleExport = () => {
    exportToExcel(formData);
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const importedData = await importFromExcel(file, isReceiptPage);
        onImportData(importedData);
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please check the file format.');
      }
    }
  };

  return (
    <div className="mb-6 flex gap-4">
      <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
        <Download size={16} />
        Export to Excel
      </Button>
      <div className="relative">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImport}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Button variant="outline" className="flex items-center gap-2">
          <Upload size={16} />
          Import from Excel
        </Button>
      </div>
    </div>
  );
};

export default ImportExportButtons;
