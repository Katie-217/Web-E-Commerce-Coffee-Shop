import React from 'react';
import ExportDropdown from '../../../../../../components/ExportDropdown';
import { ExportFormat } from '../../../../../../utils/exportUtils';

type CustomerListHeaderProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddCustomer?: () => void;
  exportDisabled?: boolean;
  onExport?: (type: ExportFormat) => void;
};

const CustomerListHeader: React.FC<CustomerListHeaderProps> = ({
  searchValue,
  onSearchChange,
  onAddCustomer,
  exportDisabled = false,
  onExport,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <h2 className="text-2xl font-bold text-text-primary">Customers</h2>
      <div className="flex gap-2 items-center">
        <input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          type="text"
          placeholder="Search customer"
          className="bg-background-dark border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-64"
        />
        <ExportDropdown disabled={exportDisabled} onExport={onExport} />
        {onAddCustomer && (
          <button
            onClick={onAddCustomer}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            + Add Customer
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerListHeader;


