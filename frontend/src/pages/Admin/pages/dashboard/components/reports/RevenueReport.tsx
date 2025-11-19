import React from 'react';
import { ChevronDown } from 'lucide-react';

import Card from '../common/Card';

const RevenueReport: React.FC = () => {
  const data = [280, 200, 250, 220, 300, 260, 290, 240, 270];
  const expenseData = [-100, -150, -80, -180, -120, -140, -110, -190, -130];
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

  return (
    <Card className="col-span-1 md:col-span-3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-text-primary">Revenue Report</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <span className="text-text-secondary">Earning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent-yellow rounded-sm" />
            <span className="text-text-secondary">Expense</span>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="w-3/4 pl-8">
          <div className="h-64 border-l border-b border-gray-700 flex justify-around items-end relative">
            <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-xs text-text-secondary">
              <span>300</span>
              <span>200</span>
              <span>100</span>
              <span>0</span>
              <span>-100</span>
              <span>-200</span>
            </div>
            {data.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center w-full h-full justify-end">
                <div className="h-full w-full flex flex-col justify-end items-center">
                  <div
                    className="bg-primary rounded-t-md"
                    style={{ height: `${(val / 300) * 50}%`, width: '40%' }}
                  />
                  <div
                    className="bg-accent-yellow rounded-b-md"
                    style={{ height: `${(Math.abs(expenseData[idx]) / 200) * 50}%`, width: '40%' }}
                  />
                </div>
                <span className="text-xs text-text-secondary mt-1">{labels[idx]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/4 border-l border-gray-700 pl-4 flex flex-col justify-between">
          <div>
            <button className="w-full flex justify-between items-center bg-background-dark p-2 rounded-md text-sm hover:bg-background-dark hover:transform-none hover:shadow-none">
              2025 <ChevronDown size={16} />
            </button>
            <p className="text-3xl font-bold mt-4">$25,825</p>
            <p className="text-sm text-text-secondary">Budget: 56,800</p>
          </div>
          <div className="h-16">
            <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path
                d="M 0 15 C 10 5, 20 25, 30 15 S 50 25, 60 15 S 80 5, 90 15, 100 20"
                stroke="#8b5cf6"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 0 22 C 10 12, 20 32, 30 22 S 50 32, 60 22 S 80 12, 90 22, 100 27"
                stroke="#4b5563"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="3 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <button className="bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Increase Button
          </button>
        </div>
      </div>
    </Card>
  );
};

export default RevenueReport;





