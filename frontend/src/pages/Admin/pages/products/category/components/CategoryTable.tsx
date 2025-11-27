import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Badge from '../../../../components/Badge';

type Category = {
  id: string | number;
  name: string;
  identifier?: string;
  productCount: number;
  status: string;
};

type CategoryTableProps = {
  categories: Category[];
  paginatedCategories: Category[];
  startEntry: number;
  endEntry: number;
  totalEntries: number;
  currentPage: number;
  totalPages: number;
  onCategoryClick: (name: string, e?: React.MouseEvent) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onPageChange: (page: number) => void;
};

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  paginatedCategories,
  startEntry,
  endEntry,
  totalEntries,
  currentPage,
  totalPages,
  onCategoryClick,
  onEdit,
  onDelete,
  onPageChange,
}) => (
  <>
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
          {paginatedCategories.length === 0 && (
            <tr>
              <td colSpan={4} className="p-6 text-center text-text-secondary">
                No categories found
              </td>
            </tr>
          )}
          {paginatedCategories.map((category) => (
            <tr
              key={category.id}
              className="border-b border-gray-700 transition-colors hover:bg-gray-800/50 cursor-pointer"
              onClick={(e) => onCategoryClick(category.name, e)}
            >
              <td className="p-3">
                <span className="font-semibold text-text-primary hover:text-primary">{category.name}</span>
              </td>
              <td className="p-3 text-text-secondary">{category.productCount}</td>
              <td className="p-3">
                <Badge color={category.status === 'Active' ? 'green' : 'gray'}>{category.status}</Badge>
              </td>
              <td className="p-3 text-center">
                <div className="flex justify-center items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="text-text-secondary hover:text-primary"
                    onClick={() => onEdit(category)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-text-secondary hover:text-accent-red"
                    onClick={() => onDelete(category)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex justify-between items-center mt-6 text-sm text-text-secondary">
      <p>
        Showing {startEntry} to {endEntry} of {totalEntries} entries
      </p>
      <div className="flex items-center gap-1">
        <button
          className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
          <button
            key={page}
            className={`px-3 py-1 rounded-md ${page === currentPage ? 'bg-primary text-white' : 'hover:bg-gray-700'}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
          }`}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  </>
);

export default CategoryTable;


