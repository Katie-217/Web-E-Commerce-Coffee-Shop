import React from 'react';
import { Plus } from 'lucide-react';

type CategoryToolbarProps = {
  onAddClick: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

const CategoryToolbar: React.FC<CategoryToolbarProps> = ({ onAddClick, searchValue, onSearchChange }) => (
  <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
    <h2 className="text-2xl font-bold text-text-primary">Category List</h2>
    <div className="flex items-center gap-2 w-full md:w-auto">
      <input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search category..."
        className="flex-1 md:flex-none bg-background-dark border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        className="bg-primary text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
        onClick={onAddClick}
      >
        <Plus size={18} />
        Add Category
      </button>
    </div>
  </div>
);

export default CategoryToolbar;






