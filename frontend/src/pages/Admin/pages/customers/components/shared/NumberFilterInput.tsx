import React from 'react';

type NumberFilterInputProps = {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  min?: number;
};

const NumberFilterInput: React.FC<NumberFilterInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter value',
  min = 0,
}) => (
  <div className="space-y-2">
    {label && <label className="text-xs uppercase text-text-secondary">{label}</label>}
    <input
      type="number"
      min={min}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

export default NumberFilterInput;




