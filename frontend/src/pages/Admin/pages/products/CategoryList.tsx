import React from 'react';
import { MOCK_CATEGORIES } from '../../constants';
import Badge from '../../components/Badge';
import { Plus, Edit, Trash2 } from 'lucide-react';

const CategoryList: React.FC = () => {
  return (
    <div className="bg-background-light p-6 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Category List</h2>
        <div className="flex items-center gap-2">
            <input type="text" placeholder="Search category..." className="bg-background-dark border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"/>
            <button className="bg-primary text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
                <Plus size={18}/>
                Add Category
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700 text-sm text-text-secondary">
              <th className="p-3">Category Name</th>
              <th className="p-3">Total Products</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CATEGORIES.map((category) => (
              <tr key={category.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                <td className="p-3">
                    <p className="font-semibold text-text-primary">{category.name}</p>
                </td>
                <td className="p-3 text-text-secondary">{category.productCount}</td>
                <td className="p-3">
                  <Badge color={category.status === 'Active' ? 'green' : 'gray'}>{category.status}</Badge>
                </td>
                <td className="p-3 text-center">
                    <div className="flex justify-center items-center gap-2">
                        <button className="text-text-secondary hover:text-primary"><Edit size={16}/></button>
                        <button className="text-text-secondary hover:text-accent-red"><Trash2 size={16}/></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 text-sm text-text-secondary">
          <p>Showing 1 to {MOCK_CATEGORIES.length} of {MOCK_CATEGORIES.length} entries</p>
          <div className="flex items-center gap-1">
              <button className="px-3 py-1 rounded-md hover:bg-gray-700">Previous</button>
              <button className="px-3 py-1 rounded-md bg-primary text-white">1</button>
              <button className="px-3 py-1 rounded-md hover:bg-gray-700">Next</button>
          </div>
      </div>
    </div>
  );
};

export default CategoryList;
