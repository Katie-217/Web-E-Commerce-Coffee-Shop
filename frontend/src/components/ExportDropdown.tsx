import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, FileDown, FileSpreadsheet, FileText } from 'lucide-react';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

type ExportDropdownProps = {
  disabled?: boolean;
  onExport?: (format: ExportFormat) => void;
  label?: string;
};

const ExportDropdown: React.FC<ExportDropdownProps> = ({ disabled = false, onExport, label = 'Export' }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleExport = (format: ExportFormat) => {
    if (disabled) return;
    onExport?.(format);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition font-semibold ${
          disabled
            ? 'bg-background-light border border-gray-700 text-text-secondary opacity-50 cursor-not-allowed'
            : 'bg-primary text-white border border-primary hover:bg-primary/90 cursor-pointer shadow-md'
        }`}
      >
        <span>{label}</span>
        <ChevronDown size={16} />
      </button>
      {open && !disabled && (
        <div className="absolute right-0 mt-2 w-44 bg-background-light border border-gray-700 rounded-lg shadow-xl z-10 p-2">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"
            onClick={() => handleExport('csv')}
          >
            <FileDown size={16} /> Csv
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"
            onClick={() => handleExport('excel')}
          >
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"
            onClick={() => handleExport('pdf')}
          >
            <FileText size={16} /> Pdf
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;


