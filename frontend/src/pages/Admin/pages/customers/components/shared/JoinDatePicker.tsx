import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

type JoinDatePickerProps = {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

const JoinDatePicker: React.FC<JoinDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'mm/dd/yyyy',
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const toISO = (val?: string) => {
    if (!val) return '';
    const [mm, dd, yyyy] = val.split('/');
    if (mm && dd && yyyy) {
      return `${yyyy}-${mm}-${dd}`;
    }
    return '';
  };

  const handleSelect = (raw: string) => {
    if (!raw) {
      onChange('');
      return;
    }
    const [yyyy, mm, dd] = raw.split('-');
    onChange(`${mm}/${dd}/${yyyy}`);
  };

  return (
    <div className="space-y-2">
      {label ? <label className="text-xs uppercase text-text-secondary">{label}</label> : null}
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={value}
          placeholder={placeholder}
          onClick={() => inputRef.current?.showPicker?.()}
          className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 text-text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.showPicker?.()}
          className="p-2 rounded-lg border border-gray-600 text-text-secondary hover:text-white hover:border-primary"
          aria-label={`Pick ${label || 'date'}`}
        >
          <Calendar size={16} />
        </button>
        <input
          type="date"
          ref={inputRef}
          value={toISO(value)}
          onChange={(e) => handleSelect(e.target.value)}
          className="absolute opacity-0 pointer-events-none h-0 w-0"
          tabIndex={-1}
        />
      </div>
    </div>
  );
};

export default JoinDatePicker;




