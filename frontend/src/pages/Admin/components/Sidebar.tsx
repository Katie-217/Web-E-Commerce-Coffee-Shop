import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, ChevronDown, ChevronUp } from 'lucide-react';

const ICONS: { [key: string]: React.ElementType } = {
  Dashboard: LayoutDashboard,
  Orders: ShoppingCart,
  Customers: Users,
};

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const NavLink: React.FC<{
  pageName: string;
  activePage: string;
  onClick: () => void;
  icon: React.ElementType;
}> = ({ pageName, activePage, onClick, icon: Icon }) => {
  const isActive = activePage === pageName;

  return (
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-primary text-white'
            : 'text-text-secondary hover:bg-background-light hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        <span className="font-medium">{pageName}</span>
      </a>
    </li>
  );
};

const ProductMenu: React.FC<SidebarProps> = ({ activePage, setActivePage, onClose }) => {
    const allProductPages = ['Product List', 'Add Product', 'Category List', 'Product Detail'];
    const visibleProductPages = ['Product List', 'Category List'];
    const isProductPageActive = allProductPages.includes(activePage);
    const [isOpen, setIsOpen] = useState(isProductPageActive);
    
    useEffect(() => {
        if(isProductPageActive){
            setIsOpen(true);
        }
    }, [activePage, isProductPageActive]);


    return (
        <li>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full p-3 my-1 rounded-lg transition-colors duration-200 ${
                    isProductPageActive
                        ? 'text-white'
                        : 'text-text-secondary'
                } hover:bg-background-light hover:text-white`}
            >
                <div className="flex items-center">
                    <Package className="w-5 h-5 mr-3" />
                    <span className="font-medium">Products</span>
                </div>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {isOpen && (
                <ul className="pl-6 mt-1 space-y-1 overflow-visible">
                    {visibleProductPages.map(page => (
                         <li key={page} className="overflow-visible">
                         <a href="#"
                           onClick={(e) => { 
                             e.preventDefault(); 
                             setActivePage(page);
                             onClose?.();
                           }}
                           className={`flex items-center p-2 rounded-lg text-sm transition-colors duration-200 ${
                             activePage === page
                               ? 'bg-primary text-white'
                               : 'text-text-secondary hover:bg-background-light hover:text-white'
                           }`}
                         >
                           {page}
                         </a>
                       </li>
                    ))}
                </ul>
            )}
        </li>
    );
};



const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen = false, onClose }) => {
  const navItems = ['Dashboard', 'Orders', 'Customers'];
  const sidebarRef = useRef<HTMLElement | null>(null);

  // Removed auto-close on outside click - sidebar only closes when clicking menu icon

  return (
    <aside
      ref={sidebarRef as unknown as React.RefObject<HTMLElement>}
      className={`bg-background-light fixed z-40 rounded-lg border border-gray-700 shadow-xl transform-gpu transition-all duration-300 ease-in-out origin-top
        left-0 top-14 md:top-16 w-64 max-w-[85vw] h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] max-h-[calc(100vh-3.5rem)] md:max-h-[calc(100vh-4rem)]
        lg:left-4 lg:top-32 lg:w-64 lg:max-w-none lg:h-auto lg:max-h-[calc(100vh-8rem)]
        overflow-y-auto overflow-x-visible
        ${
        isOpen
          ? 'opacity-100 translate-y-0 scale-y-100 pointer-events-auto'
          : 'opacity-0 -translate-y-2 scale-y-95 max-h-0 pointer-events-none'
      }`}
    >
      <div className="p-2">
      <nav className="overflow-visible">
        <ul className="space-y-1">
          {navItems.map((item) => {
            if (item === 'Dashboard') {
                return <NavLink
                    key={item}
                    pageName={item}
                    activePage={activePage}
                    onClick={() => { setActivePage(item); }}
                    icon={ICONS[item]}
                />
            }
            return null;
          })}
          <ProductMenu activePage={activePage} setActivePage={setActivePage} onClose={onClose} />
          {navItems.map((item) => {
            if (item !== 'Dashboard') {
                return <NavLink
                    key={item}
                    pageName={item}
                    activePage={activePage}
                    onClick={() => { setActivePage(item); }}
                    icon={ICONS[item]}
                />
            }
            return null;
          })}
        </ul>
       </nav>
      </div>
    </aside>
  );
};

export default Sidebar;