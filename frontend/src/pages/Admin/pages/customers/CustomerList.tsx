import React, { useRef, useState, useEffect } from 'react';
import Badge from '../../components/Badge';
import { Printer, FileDown, FileSpreadsheet, FileText, Copy as CopyIcon, ChevronDown } from 'lucide-react';
import { fetchCustomers } from '../../../../api/customers';
  const getDisplayCode = (val: string | number | undefined | null) => {
    const s = String(val || '');
    if (!s) return '';
    const hex = s.replace(/[^a-fA-F0-9]/g, '') || s;
    const last4 = hex.slice(-4).padStart(4, '0');
    return `#${last4}`;
  };

type CustomerListProps = {
  onSelectCustomer: (id: string) => void;
};

const CustomerList: React.FC<CustomerListProps> = ({ onSelectCustomer }) => {
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState<string>('');

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const allChecked = selectedIds.length === customers.length && customers.length > 0;
  const noneChecked = selectedIds.length === 0;

  function toggleAll() {
    if (allChecked) setSelectedIds([]);
    else setSelectedIds(customers.map((u: any) => String(u._id)));
  }
  function toggleOne(id: string) {
    setSelectedIds((selected) =>
      selected.includes(id)
        ? selected.filter((i) => i !== id)
        : [...selected, id]
    );
  }

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchCustomers({ q, page: 1, limit: 50 });
        console.log('📡 /api/customers response', res);
        const items = res?.data || res?.items || [];
        console.log(`✅ loaded customers: ${items.length}`);
        if (!cancelled) setCustomers(items);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load customers');
          setCustomers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [q]);

  return (
    <div className="bg-background-light p-6 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Customers</h2>
        <div className="flex gap-2 items-center">
          <input value={q} onChange={(e) => setQ(e.target.value)} type="text" placeholder="Search customer" className="bg-background-dark border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-64" />
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
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="p-3 text-text-secondary" colSpan={6}>Loading...</td></tr>
            )}
            {error && !loading && (
              <tr><td className="p-3 text-red-300" colSpan={6}>{error}</td></tr>
            )}
            {!loading && customers.map((u: any) => (
              <tr
                key={u._id}
                className="border-b border-gray-700 hover:bg-gray-800/40 transition-colors cursor-pointer"
                onClick={() => onSelectCustomer(String(u.id || u._id))}
              >
                <td className="p-3" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(String(u.id || u._id))}
                    onChange={() => toggleOne(String(u.id || u._id))}
                    aria-label={`Select customer ${u.fullName || u.name}`}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={u.avatarUrl || u.avatar} alt={u.fullName || u.name} className="w-9 h-9 rounded-full" />
                    <div>
                      <p className="font-semibold text-text-primary">{u.fullName || u.name}</p>
                      <p className="text-xs text-text-secondary">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-text-secondary">{getDisplayCode(u.id || u._id)}</td>
                <td className="p-3 text-text-secondary">{u.email || '-'}</td>
                <td className="p-3"><Badge color={u.status === 'inactive' ? 'yellow' : u.status === 'banned' ? 'red' : 'green'}>{(u.status || 'active').toString()}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6 text-sm text-text-secondary">
        <p>Showing {customers.length} entr{customers.length === 1 ? 'y' : 'ies'}</p>
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


