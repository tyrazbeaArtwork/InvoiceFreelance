import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import InvoiceTemplate from '../components/InvoiceTemplate';
import { generatePDF } from '../utils/pdfGenerator';
import { templates } from '../utils/templateRegistry';
import { getAssetPath } from '../utils/assetHelper';

const TemplatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [currentTemplate, setCurrentTemplate] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (location.state && location.state.formData) {
      setFormData(location.state.formData);
      setCurrentTemplate(location.state.selectedTemplate || 1);
    } else {
      // If no form data in location state, try to load from localStorage
      const savedFormData = localStorage.getItem('formData');
      if (savedFormData) {
        setFormData(JSON.parse(savedFormData));
      }
    }
  }, [location.state]);

  const handleTemplateChange = (templateNumber) => {
    setCurrentTemplate(templateNumber);
  };

  const handleDownloadPDF = async () => {
    if (formData && !isDownloading) {
      setIsDownloading(true);
      try {
        await generatePDF(formData, currentTemplate);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleDownloadPDF} disabled={isDownloading}>
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            "Download PDF"
          )}
        </Button>
      </div>

      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-4">
          {templates.map((template, index) => (
            <div
              key={index}
              className={`cursor-pointer p-2 border rounded-lg transition-all min-w-[100px] flex flex-col items-center ${currentTemplate === index + 1
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                }`}
              onClick={() => handleTemplateChange(index + 1)}
            >
              <img
                src={getAssetPath(`assets/template${index + 1}-preview.png`)}
                alt={template.name}
                className="w-20 h-28 object-cover rounded mb-2 border border-gray-100"
              />
              <span className={`text-xs font-medium ${currentTemplate === index + 1 ? "text-blue-700" : "text-gray-600"
                }`}>
                {template.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-[210mm] h-[297mm] mx-auto border shadow-lg">
        <InvoiceTemplate data={formData} templateNumber={currentTemplate} />
      </div>
    </div>
  );
};

export default TemplatePage;
