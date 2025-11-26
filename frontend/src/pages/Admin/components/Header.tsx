
import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  logoUrl?: string;
}

const Header: React.FC<HeaderProps> = ({ logoUrl }) => {
  return (
    <header className="h-16 flex items-center justify-between px-4 bg-background-light border-b border-gray-700 flex-shrink-0">
      {/* Left: logo */}
      <div className="flex items-center gap-4">
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded bg-white" />
        )}
        <h1 className="text-lg font-semibold text-text-primary">Admin Dashboard</h1>
      </div>

      {/* Right side icons and user menu */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white">
          <Bell className="w-6 h-6" />
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
