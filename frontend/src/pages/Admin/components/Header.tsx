
import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  logoUrl?: string;
}

const Header: React.FC<HeaderProps> = ({ logoUrl }) => {
  return (
    <header className="h-16 flex items-center justify-between px-4 bg-background-light border-b border-gray-700 flex-shrink-0">
      {/* Left: logo + search */}
      <div className="flex items-center gap-4 w-full max-w-xl">
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded bg-white" />
        )}
        {/* Search Bar */}
        <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 bg-background-dark border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary"
        />
        </div>
      </div>

      {/* Right side icons and user menu */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white">
          <Bell className="w-6 h-6" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white">
          <Settings className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-3">
          <img
            src="https://picsum.photos/seed/admin/40/40"
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="font-semibold text-white">John Doe</div>
            <div className="text-sm text-gray-400">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
