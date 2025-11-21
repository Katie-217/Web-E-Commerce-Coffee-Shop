import React from 'react';
import Badge from '../../../components/Badge';
import { DollarSign, Gift, Star, Crown } from 'lucide-react';
import { formatVND } from '../../../../../utils/currency';

const OverviewCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Account Balance Card */}
      <div className="bg-background-light p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <h4 className="text-sm font-semibold text-text-primary">Account Balance</h4>
        </div>
        <p className="text-lg font-bold text-white mb-1">
          <span className="text-purple-400">{formatVND(2345)}</span> Credit Left
        </p>
        <p className="text-xs text-text-secondary">Account balance for next purchase</p>
      </div>

      {/* Loyalty Program Card */}
      <div className="bg-background-light p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-green-400" />
          </div>
          <h4 className="text-sm font-semibold text-text-primary">Loyalty Program</h4>
        </div>
        <div className="mb-2">
          <Badge color="green">Platinum member</Badge>
        </div>
        <p className="text-xs text-text-secondary">3000 points to next tier</p>
      </div>

      {/* Wishlist Card */}
      <div className="bg-background-light p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-orange-400" />
          </div>
          <h4 className="text-sm font-semibold text-text-primary">Wishlist</h4>
        </div>
        <p className="text-lg font-bold text-white mb-1">
          <span className="text-orange-400">15</span> Items in wishlist
        </p>
        <p className="text-xs text-text-secondary">Receive notification when items go on sale</p>
      </div>

      {/* Coupons Card */}
      <div className="bg-background-light p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-blue-400" />
          </div>
          <h4 className="text-sm font-semibold text-text-primary">Coupons</h4>
        </div>
        <p className="text-lg font-bold text-white mb-1">
          <span className="text-blue-400">21</span> Coupons you win
        </p>
        <p className="text-xs text-text-secondary">Use coupon on next purchase</p>
      </div>
    </div>
  );
};

export default OverviewCards;

