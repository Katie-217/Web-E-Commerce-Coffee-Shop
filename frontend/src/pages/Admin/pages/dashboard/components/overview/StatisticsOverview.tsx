import React, { useEffect, useState } from 'react';
import { Clock, DollarSign, Package, Users } from 'lucide-react';

import { fetchOrders } from '../../../../../../api/orders';
import { formatVND } from '../../../../../../utils/currency';
import Card from '../common/Card';

const StatisticsOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([
    { icon: Users, value: '0', label: 'Total Users', color: 'text-blue-400' },
    { icon: Clock, value: '0', label: 'New Users', color: 'text-green-400' },
    { icon: Package, value: '0', label: 'Total Orders', color: 'text-red-400' },
    { icon: DollarSign, value: formatVND(0), label: 'Revenue', color: 'text-yellow-400' },
  ]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const { fetchCustomers } = await import('../../../../../../api/customers');
        const cres = await fetchCustomers({ page: 1, limit: 1 });
        const totalCustomers =
          cres?.pagination?.total ??
          (Array.isArray(cres?.data) ? cres.data.length : 0) ??
          0;
        const newUsers = 0;

        const orResFirst = await fetchOrders({ page: 1, limit: 1 });
        const totalOrders = orResFirst?.pagination?.total ?? 0;
        const limitForRevenue = Math.min(totalOrders, 10000);
        const orRes = await fetchOrders({ page: 1, limit: limitForRevenue });
        const orders = Array.isArray(orRes?.data)
          ? orRes.data
          : Array.isArray(orRes?.items)
            ? orRes.items
            : [];
        const revenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);

        if (!cancelled) {
          setStats([
            {
              icon: Users,
              value: totalCustomers.toLocaleString('vi-VN'),
              label: 'Total Users',
              color: 'text-blue-400',
            },
            {
              icon: Clock,
              value: newUsers.toLocaleString('vi-VN'),
              label: 'New Users',
              color: 'text-green-400',
            },
            {
              icon: Package,
              value: totalOrders.toLocaleString('vi-VN'),
              label: 'Total Orders',
              color: 'text-red-400',
            },
            {
              icon: DollarSign,
              value: formatVND(revenue),
              label: 'Revenue',
              color: 'text-yellow-400',
            },
          ]);
        }
      } catch (e) {
        if (!cancelled) {
          setStats([
            { icon: Users, value: '0', label: 'Total Users', color: 'text-blue-400' },
            { icon: Clock, value: '0', label: 'New Users', color: 'text-green-400' },
            { icon: Package, value: '0', label: 'Total Orders', color: 'text-red-400' },
            {
              icon: DollarSign,
              value: formatVND(0),
              label: 'Revenue',
              color: 'text-yellow-400',
            },
          ]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="col-span-1 md:col-span-5 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-text-primary">Simple Dashboard</h3>
        <p className="text-sm text-text-secondary">Updated 1 month ago</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <div className="p-2 bg-gray-700 rounded-md">
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">{loading ? '...' : stat.value}</p>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StatisticsOverview;

