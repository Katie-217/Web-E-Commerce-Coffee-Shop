import React, { useState, useRef, useEffect } from 'react';
import Badge from '../../components/Badge';
import { MOCK_USERS, MOCK_ORDERS } from '../../constants';
import { ChevronLeft } from 'lucide-react';

type Props = {
  customerId: number | null;
  onBack: () => void;
  onOrderClick?: (orderId: string) => void;
};

const CustomerDetail: React.FC<Props> = ({ customerId, onBack, onOrderClick }) => {
  const customer = MOCK_USERS.find(u => u.id === customerId) || MOCK_USERS[0];
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);
  const orders = MOCK_ORDERS.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* Back Button */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-md bg-background-dark border border-gray-700 text-text-secondary hover:text-white flex items-center">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Customer ID #{String(customer.id).padStart(6,'0')}</h2>
            <p className="text-sm text-text-secondary">Aug 17, 2020, 5:48 (ET)</p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-lg bg-red-600 text-white">Delete Customer</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background-light p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-4">
            <img src={customer.avatar} alt={customer.name} className="w-20 h-20 rounded-xl"/>
            <div>
              <p className="text-lg font-semibold text-text-primary">{customer.name}</p>
              <p className="text-xs text-text-secondary">Customer ID #{String(customer.id).padStart(6,'0')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-sm text-text-secondary">Orders</p>
              <p className="text-xl font-bold text-white">184</p>
            </div>
            <div className="bg-background-dark p-4 rounded-lg">
              <p className="text-sm text-text-secondary">Spent</p>
              <p className="text-xl font-bold text-white">$12,378</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-text-secondary">Email:</span><span className="text-white">{customer.email}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Country:</span><span className="text-white">USA</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Status:</span><span><Badge color={'green'}>Active</Badge></span></div>
          </div>

          <button className="mt-6 w-full bg-primary text-white py-2 rounded-lg">Edit Details</button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background-light p-6 rounded-lg">
              <p className="text-text-secondary text-sm">Account Balance</p>
              <p className="text-2xl font-bold text-white">$2345</p>
              <p className="text-xs text-text-secondary">Account balance for next purchase</p>
            </div>
            <div className="bg-background-light p-6 rounded-lg">
              <p className="text-text-secondary text-sm">Loyalty Program</p>
              <p className="text-xs text-green-400">Platinum member</p>
              <p className="text-xs text-text-secondary">3000 points to next tier</p>
            </div>
          </div>

          <div className="bg-background-light p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-text-primary">Orders placed</p>
              <input placeholder="Search order" className="bg-background-dark border border-gray-600 rounded-lg px-3 py-2"/>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-sm text-text-secondary">
                    <th className="p-3">ORDER</th>
                    <th className="p-3">DATE</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">SPENT</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <td className="p-3">
                        {onOrderClick ? (
                          <button
                            onClick={() => onOrderClick(o.id)}
                            className="text-primary hover:underline font-semibold cursor-pointer"
                          >
                            {o.id}
                          </button>
                        ) : (
                          <span className="text-text-secondary">{o.id}</span>
                        )}
                      </td>
                      <td className="p-3 text-text-secondary">{o.date}</td>
                      <td className="p-3"><Badge color={o.status === 'Delivered' ? 'green' : o.status === 'Cancelled' ? 'red' : 'yellow'}>{o.status}</Badge></td>
                      <td className="p-3 text-text-secondary">${o.payment.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;


