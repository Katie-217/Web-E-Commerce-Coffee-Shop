import React from 'react';
import { Rocket } from 'lucide-react';

type UpgradeToPremiumCardProps = {
  onUpgrade: () => void;
};

const UpgradeToPremiumCard: React.FC<UpgradeToPremiumCardProps> = ({ onUpgrade }) => {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg shadow-lg relative overflow-hidden">
      <div className="relative z-10">
        <h4 className="text-lg font-bold text-white mb-2">Upgrade to premium</h4>
        <p className="text-sm text-purple-100 mb-4">Upgrade customer to premium membership to access pro features.</p>
        <button
          onClick={onUpgrade}
          className="w-full bg-white text-purple-600 font-semibold py-2 rounded-lg hover:bg-purple-50 transition-colors"
        >
          Upgrade to premium
        </button>
      </div>
      <Rocket className="absolute right-4 top-4 w-16 h-16 text-white/20" />
    </div>
  );
};

export default UpgradeToPremiumCard;

