import React from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  Circle,
  Clock,
  DollarSign,
  Dot,
  MoreHorizontal,
  Package,
  User,
  Users,
} from 'lucide-react';

// Card Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`bg-background-light p-6 rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

const StatisticsCard = () => {
    const stats = [
        { icon: Clock, value: "230k", label: "Sales", color: "text-blue-400" },
        { icon: Users, value: "8.549k", label: "Customers", color: "text-green-400" },
        { icon: Package, value: "1.423k", label: "Products", color: "text-red-400" },
        { icon: DollarSign, value: "$9745", label: "Revenue", color: "text-yellow-400" },
    ];
    return (
        <Card className="col-span-1 md:col-span-5 pt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-text-primary">Statistics</h3>
                <p className="text-sm text-text-secondary">Updated 1 month ago</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(stat => (
                    <div key={stat.label} className="flex items-center gap-3">
                        <div className={`p-2 bg-gray-700 rounded-md`}>
                            <stat.icon size={24} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                            <p className="text-sm text-text-secondary">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
};

const ProfitCard = () => (
    <Card>
        <p className="text-sm text-text-secondary">Profit</p>
        <p className="text-xs text-text-secondary">Last Month</p>
        <div className="flex justify-between items-end mt-4">
            <p className="text-3xl font-bold text-text-primary">624k</p>
            <div className="flex items-center text-sm text-accent-green">
                <ArrowUpRight size={16} className="mr-1"/>
                <span>+8.24%</span>
            </div>
        </div>
        <div className="h-20 mt-2">
           <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M 0 30 L 20 20 L 40 25 L 60 15 L 80 22 L 100 10" stroke="#00E096" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 0 30 L 20 20 L 40 25 L 60 15 L 80 22 L 100 10" stroke="url(#profit-gradient)" strokeWidth="2" fill="url(#profit-gradient)" />
              <defs>
                <linearGradient id="profit-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00E096" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#00E096" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
        </div>
    </Card>
);

const ExpensesCard = () => (
     <Card className="flex flex-col justify-between">
        <div>
            <p className="text-sm text-text-secondary">Expenses</p>
            <p className="text-3xl font-bold text-text-primary mt-1">82.5k</p>
        </div>
        <div className="flex justify-center items-center my-4">
            <div className="relative w-32 h-32">
                 <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4b5563"
                        strokeWidth="3"
                    />
                    <path
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        strokeDasharray="78, 100"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">78%</span>
                </div>
            </div>
        </div>
        <p className="text-xs text-text-secondary text-center">$21k Expenses more than last month</p>
    </Card>
);

const GeneratedLeadsCard = () => (
    <Card>
        <p className="text-sm text-text-secondary">Generated Leads</p>
        <p className="text-xs text-text-secondary">Monthly Report</p>
        <div className="flex justify-between items-center mt-4">
            <div>
                <p className="text-3xl font-bold text-text-primary">4,350</p>
                 <div className="flex items-center text-sm text-accent-green mt-1">
                    <ArrowUp size={16} className="mr-1"/>
                    <span>15.8%</span>
                </div>
            </div>
            <div className="relative w-20 h-20">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#34d399"
                        strokeOpacity="0.3"
                        strokeWidth="3"
                    />
                     <path
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="3"
                        strokeDasharray="84, 100"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white">184</span>
                    <span className="text-xs text-text-secondary">Total</span>
                </div>
            </div>
        </div>
    </Card>
);

const RevenueReportCard = () => {
    const data = [280, 200, 250, 220, 300, 260, 290, 240, 270];
    const expenseData = [-100, -150, -80, -180, -120, -140, -110, -190, -130];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

    return (
        <Card className="col-span-1 md:col-span-3">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-text-primary">Revenue Report</h3>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded-sm"></div><span className="text-text-secondary">Earning</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-accent-yellow rounded-sm"></div><span className="text-text-secondary">Expense</span></div>
                </div>
             </div>
            <div className="flex gap-4">
                <div className="w-3/4 pl-8">
                    <div className="h-64 border-l border-b border-gray-700 flex justify-around items-end relative">
                        {/* Y-Axis labels */}
                        <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-xs text-text-secondary">
                            <span>300</span><span>200</span><span>100</span><span>0</span><span>-100</span><span>-200</span>
                        </div>
                        {data.map((val, i) => (
                           <div key={i} className="flex flex-col items-center w-full h-full justify-end">
                                <div className="h-full w-full flex flex-col justify-end items-center">
                                    <div className="bg-primary rounded-t-md" style={{height: `${val/300 * 50}%`, width: '40%'}}></div>
                                    <div className="bg-accent-yellow rounded-b-md" style={{height: `${Math.abs(expenseData[i])/200 * 50}%`, width: '40%'}}></div>
                                </div>
                                <span className="text-xs text-text-secondary mt-1">{labels[i]}</span>
                           </div>
                        ))}
                    </div>
                </div>
                <div className="w-1/4 border-l border-gray-700 pl-4 flex flex-col justify-between">
                    <div>
                        <button className="w-full flex justify-between items-center bg-background-dark p-2 rounded-md text-sm">
                            2025 <ChevronDown size={16} />
                        </button>
                        <p className="text-3xl font-bold mt-4">$25,825</p>
                        <p className="text-sm text-text-secondary">Budget: 56,800</p>
                    </div>
                    <div className="h-16">
                        <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                           <path d="M 0 15 C 10 5, 20 25, 30 15 S 50 25, 60 15 S 80 5, 90 15, 100 20" stroke="#8b5cf6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M 0 22 C 10 12, 20 32, 30 22 S 50 32, 60 22 S 80 12, 90 22, 100 27" stroke="#4b5563" strokeWidth="1.5" fill="none" strokeDasharray="3 3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                     <button className="bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors">
                        Increase Button
                    </button>
                </div>
            </div>
        </Card>
    )
};

const EarningReportsCard = () => {
    const earnings = [
        {day: 'Mo', net: 1619, income: 3571, expenses: 430},
        {day: 'Tu', net: 1400, income: 3200, expenses: 600},
        {day: 'We', net: 1800, income: 4000, expenses: 500},
        {day: 'Th', net: 1200, income: 2800, expenses: 700},
        {day: 'Fr', net: 2100, income: 4500, expenses: 400},
        {day: 'Sa', net: 1500, income: 3400, expenses: 550},
        {day: 'Su', net: 1300, income: 3000, expenses: 650},
    ];
    const maxVal = Math.max(...earnings.map(e => e.income));
    return (
        <Card>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-text-primary">Earning Reports</h3>
                    <p className="text-sm text-text-secondary">Weekly Earnings Overview</p>
                </div>
                <MoreHorizontal className="text-text-secondary cursor-pointer"/>
            </div>
            <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-500 rounded-sm"></div> Net Profit</div>
                    <div className="font-bold">$1,619 <span className="text-accent-green text-xs font-normal">▲ 18.6%</span></div>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Total Income</div>
                    <div className="font-bold">$3,571 <span className="text-accent-green text-xs font-normal">▲ 39.6%</span></div>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-700 rounded-sm"></div> Total Expenses</div>
                    <div className="font-bold">$430 <span className="text-accent-green text-xs font-normal">▲ 52.8%</span></div>
                </div>
            </div>
            <div className="h-32 mt-4 flex justify-around items-end gap-2">
                {earnings.map(e => (
                     <div key={e.day} className="flex flex-col items-center w-full h-full justify-end">
                        <div className="bg-primary rounded-md w-3/4" style={{height: `${(e.net/maxVal)*100}%`}}></div>
                        <span className="text-xs text-text-secondary mt-1">{e.day}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

const PopularProductsCard = () => {
    const products = [
        {name: "Apple iPhone 13", item: "FXZ-4567", price: "$999.29", img: "https://i.imgur.com/sI12sBq.png"},
        {name: "Nike Air Jordan", item: "FXZ-3456", price: "$72.40", img: "https://i.imgur.com/OPe1znv.png"},
        {name: "Beats Studio 2", item: "FXZ-9485", price: "$99", img: "https://i.imgur.com/i4grs22.png"},
        {name: "Apple Watch Series 7", item: "FXZ-2345", price: "$249.99", img: "https://i.imgur.com/M5k3DDH.png"},
        {name: "Amazon Echo Dot", item: "FXZ-8959", price: "$79.40", img: "https://i.imgur.com/zBKz2eT.png"},
        {name: "Play Station Console", item: "FXZ-7892", price: "$129.48", img: "https://i.imgur.com/c4TA85a.png"},
    ];
    return (
        <Card>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-text-primary">Popular Products</h3>
                    <p className="text-sm text-text-secondary">Total 10.4k Visitors</p>
                </div>
                <MoreHorizontal className="text-text-secondary cursor-pointer"/>
            </div>
            <div className="space-y-4 mt-4">
                {products.map(p => (
                    <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={p.img} alt={p.name} className="w-10 h-10 rounded-md bg-gray-700 p-1"/>
                            <div>
                                <p className="font-semibold text-text-primary">{p.name}</p>
                                <p className="text-xs text-text-secondary">Item: {p.item}</p>
                            </div>
                        </div>
                        <p className="font-semibold">{p.price}</p>
                    </div>
                ))}
            </div>
        </Card>
    )
}

const OrdersByCountriesCard = () => {
    const orders = [
        { type: "SENDER", name: "Veronica Herman", address: "101 Boulder, California(CA), 95959", status: "completed" },
        { type: "RECEIVER", name: "Barry Schowalter", address: "939 Orange, California(CA), 92118", status: "pending" },
        { type: "SENDER", name: "Myrtle Ullrich", address: "152 Windsor, California(CA), 95492", status: "completed" },
        { type: "RECEIVER", name: "Helen Jacobs", address: "487 Sunset, California(CA), 94043", status: "pending" },
    ];
    return (
        <Card>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-text-primary">Orders by Countries</h3>
                    <p className="text-sm text-text-secondary">62 deliveries in progress</p>
                </div>
                <MoreHorizontal className="text-text-secondary cursor-pointer"/>
            </div>
            <div className="flex justify-around border-b border-gray-700 mt-4 text-sm">
                <button className="py-2 text-primary border-b-2 border-primary font-semibold">New</button>
                <button className="py-2 text-text-secondary">Preparing</button>
                <button className="py-2 text-text-secondary">Shipping</button>
            </div>
            <div className="mt-4 space-y-4">
                {orders.map((order, index) => (
                    <div key={index} className="flex gap-4">
                         <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${order.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`}>
                                <Circle size={8} fill="white" stroke="none" />
                            </div>
                            {index !== orders.length - 1 && <div className="w-px h-full bg-gray-600"></div>}
                        </div>
                        <div>
                            <p className={`text-xs font-semibold ${order.status === 'completed' ? 'text-green-400' : 'text-primary'}`}>{order.type}</p>
                            <p className="font-semibold text-text-primary">{order.name}</p>
                            <p className="text-xs text-text-secondary">{order.address}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 pt-8">
      <div className="grid grid-cols-1 md:grid-cols-5">
        <StatisticsCard />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <ProfitCard/>
                     <ExpensesCard/>
                </div>
                <GeneratedLeadsCard />
          </div>
          <RevenueReportCard />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EarningReportsCard/>
          <PopularProductsCard/>
          <OrdersByCountriesCard/>
      </div>
    </div>
  );
};

export default Dashboard;