'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';

interface ExportPdfButtonProps {
  targetId: string;
  fileName: string;
}

export function ExportPdfButton({ targetId, fileName }: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const target = document.getElementById(targetId);
    if (!target) return;

    setIsExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);

      const canvas = await html2canvas(target, {
        backgroundColor: '#FFFCF5',
        scale: 2,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 20;

      pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 40;

      // Paginate if the captured content is taller than one page.
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 20;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 40;
      }

      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error('[PDF_EXPORT_ERROR]', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={() => void handleExport()}
      disabled={isExporting}
      className="flex items-center gap-2 rounded-xl border-2 border-primary/20 bg-white px-3 py-2 text-sm font-medium text-primary-dark shadow-card hover:border-primary/40 disabled:opacity-60"
    >
      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      Export PDF
    </button>
  );
}
