import React from 'react';
import { RotateCcw } from 'lucide-react';
import CountrySelect from '../shared/CountrySelect';
import NumberFilterInput from '../shared/NumberFilterInput';
import JoinDatePicker from '../shared/JoinDatePicker';

type FilterSectionProps = {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  countryFilter: string;
  onCountryFilterChange: (value: string) => void;
  ordersMin: string;
  onOrdersMinChange: (value: string) => void;
  ordersMax: string;
  onOrdersMaxChange: (value: string) => void;
  joinStart: string;
  onJoinStartChange: (value: string) => void;
  joinEnd: string;
  onJoinEndChange: (value: string) => void;
  onResetFilters: () => void;
};

const FilterSection: React.FC<FilterSectionProps> = ({
  statusFilter,
  onStatusFilterChange,
  countryFilter,
  onCountryFilterChange,
  ordersMin,
  onOrdersMinChange,
  ordersMax,
  onOrdersMaxChange,
  joinStart,
  onJoinStartChange,
  joinEnd,
  onJoinEndChange,
  onResetFilters,
}) => {
  return (
    <div className="relative bg-background-dark/40 border border-gray-700 rounded-lg pt-6 pr-4 pb-4 pl-4 mb-6">
      <button
        type="button"
        onClick={onResetFilters}
        className="absolute right-4 top-2 p-2 rounded-lg border border-gray-600 text-text-secondary hover:text-white hover:border-primary bg-background-dark"
        aria-label="Reset filters"
      >
        <RotateCcw size={16} />
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-xs uppercase text-text-secondary">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        </div>
        <CountrySelect
          value={countryFilter}
          onChange={onCountryFilterChange}
          label="Country"
        />
        <NumberFilterInput
          label="Orders min"
          value={ordersMin}
          onChange={onOrdersMinChange}
        />
        <NumberFilterInput
          label="Orders max"
          value={ordersMax}
          onChange={onOrdersMaxChange}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
        <JoinDatePicker
          label="Join date (from)"
          value={joinStart}
          onChange={onJoinStartChange}
        />
        <JoinDatePicker
          label="Join date (to)"
          value={joinEnd}
          onChange={onJoinEndChange}
        />
      </div>
    </div>
  );
};

export default FilterSection;



