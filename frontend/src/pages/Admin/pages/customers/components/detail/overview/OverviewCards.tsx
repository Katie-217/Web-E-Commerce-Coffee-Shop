import React from 'react';
import WishlistCard from './WishlistCard';
import AccountBalanceCard from './AccountBalanceCard';
import LoyaltyProgramCard from './LoyaltyProgramCard';

type OverviewCardsProps = {
  customer?: any;
  orders?: any[];
};

const OverviewCards: React.FC<OverviewCardsProps> = ({ customer, orders = [] }) => {
  const loyalty = customer?.loyalty || {};
  const currentPoints = loyalty.currentPoints || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AccountBalanceCard currentPoints={currentPoints} />
      <LoyaltyProgramCard loyalty={loyalty} orders={orders} />
      <WishlistCard customer={customer} />
    </div>
  );
};

export default OverviewCards;

