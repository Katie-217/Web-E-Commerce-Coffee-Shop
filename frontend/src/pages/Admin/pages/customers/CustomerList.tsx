import React, { useRef, useState, useEffect } from 'react';
import { MOCK_USERS } from '../../constants';
import Badge from '../../components/Badge';
import { Printer, FileDown, FileSpreadsheet, FileText, Copy as CopyIcon, ChevronDown } from 'lucide-react';

type CustomerListProps = {
  onSelectCustomer: (id: number) => void;
};

const CustomerList: React.FC<CustomerListProps> = ({ onSelectCustomer }) => {
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const allChecked = selectedIds.length === MOCK_USERS.length && MOCK_USERS.length > 0;
  const noneChecked = selectedIds.length === 0;

  function toggleAll() {
    if (allChecked) setSelectedIds([]);
    else setSelectedIds(MOCK_USERS.map(u => u.id));
  }
  function toggleOne(id: number) {
    setSelectedIds((selected) =>
      selected.includes(id)
        ? selected.filter((i) => i !== id)
        : [...selected, id]
    );
  }

  return (
    <div className="bg-background-light p-6 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Customers</h2>
        <div className="flex gap-2 items-center">
          <input type="text" placeholder="Search Order" className="bg-background-dark border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-64" />
          {/* Export Button */}
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              disabled={noneChecked}
              onClick={() => !noneChecked && setShowExport(v => !v)}
              className={`bg-background-light border border-gray-700 text-text-secondary hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition
                  ${noneChecked ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer'}
                `}
            >
              <span>Export</span>
              <ChevronDown size={16} />
            </button>
            {showExport && !noneChecked && (
              <div className="absolute right-0 mt-2 w-44 bg-background-light border border-gray-700 rounded-lg shadow-xl z-10 p-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"><Printer size={16} /> Print</button>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"><FileDown size={16} /> Csv</button>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"><FileSpreadsheet size={16} /> Excel</button>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"><FileText size={16} /> Pdf</button>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"><CopyIcon size={16} /> Copy</button>
              </div>
            )}
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-lg">+ Add Customer</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700 text-sm text-text-secondary">
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Select all customers"
                />
              </th>
              <th className="p-3">Customer</th>
              <th className="p-3">Customer ID</th>
              <th className="p-3">Country</th>
              <th className="p-3">Order</th>
              <th className="p-3">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map((u, idx) => (
              <tr
                key={u.id}
                className="border-b border-gray-700 hover:bg-gray-800/40 transition-colors cursor-pointer"
                onClick={() => onSelectCustomer(u.id)}
              >
                <td className="p-3" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(u.id)}
                    onChange={() => toggleOne(u.id)}
                    aria-label={`Select customer ${u.name}`}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full" />
                    <div>
                      <p className="font-semibold text-text-primary">{u.name}</p>
                      <p className="text-xs text-text-secondary">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-text-secondary">#{String(u.id).padStart(6,'0')}</td>
                <td className="p-3 text-text-secondary">USA</td>
                <td className="p-3 text-text-secondary">{500 - idx}</td>
                <td className="p-3 text-text-secondary">${(9000 - idx * 37).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6 text-sm text-text-secondary">
        <p>Showing 1 to {MOCK_USERS.length} of {MOCK_USERS.length} entries</p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 rounded-md hover:bg-gray-700">«</button>
          <button className="px-3 py-1 rounded-md bg-primary text-white">1</button>
          <button className="px-3 py-1 rounded-md hover:bg-gray-700">2</button>
          <button className="px-3 py-1 rounded-md hover:bg-gray-700">»</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;


