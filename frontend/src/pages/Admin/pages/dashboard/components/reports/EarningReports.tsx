import React from 'react';
import { MoreHorizontal } from 'lucide-react';

import Card from '../common/Card';

const EarningReports: React.FC = () => {
  const earnings = [
    { day: 'Mo', net: 1619, income: 3571, expenses: 430 },
    { day: 'Tu', net: 1400, income: 3200, expenses: 600 },
    { day: 'We', net: 1800, income: 4000, expenses: 500 },
    { day: 'Th', net: 1200, income: 2800, expenses: 700 },
    { day: 'Fr', net: 2100, income: 4500, expenses: 400 },
    { day: 'Sa', net: 1500, income: 3400, expenses: 550 },
    { day: 'Su', net: 1300, income: 3000, expenses: 650 },
  ];
  const maxVal = Math.max(...earnings.map((entry) => entry.income));

  return (
    <Card>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-text-primary">Earning Reports</h3>
          <p className="text-sm text-text-secondary">Weekly Earnings Overview</p>
        </div>
        <MoreHorizontal className="text-text-secondary cursor-pointer" />
      </div>
      <div className="space-y-3 mt-4">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-sm" /> Net Profit
          </div>
          <div className="font-bold">
            $1,619 <span className="text-accent-green text-xs font-normal">▲ 18.6%</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm" /> Total Income
          </div>
          <div className="font-bold">
            $3,571 <span className="text-accent-green text-xs font-normal">▲ 39.6%</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-700 rounded-sm" /> Total Expenses
          </div>
          <div className="font-bold">
            $430 <span className="text-accent-green text-xs font-normal">▲ 52.8%</span>
          </div>
        </div>
      </div>
      <div className="h-32 mt-4 flex justify-around items-end gap-2">
        {earnings.map((entry) => (
          <div key={entry.day} className="flex flex-col items-center w-full h-full justify-end">
            <div
              className="bg-primary rounded-md w-3/4"
              style={{ height: `${(entry.net / maxVal) * 100}%` }}
            />
            <span className="text-xs text-text-secondary mt-1">{entry.day}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EarningReports;

