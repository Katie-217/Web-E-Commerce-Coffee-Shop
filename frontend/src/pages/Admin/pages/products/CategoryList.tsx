import React, { useMemo, useState, useEffect } from 'react';
import { CategoriesApi } from '../../../../api/categories';
import Badge from '../../components/Badge';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ITEMS_PER_PAGE = 7;

type CategoryListProps = {
  setActivePage: (page: string) => void;
  onCategoryClick?: (categoryName: string) => void;
};

const CategoryList: React.FC<CategoryListProps> = ({ setActivePage, onCategoryClick }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await CategoriesApi.list();
        const data = res?.data || res || [];
        // Transform API data to match Category type
        const transformed = Array.isArray(data) ? data.map((cat: any, idx: number) => ({
          id: cat.id || cat._id || idx + 1,
          name: cat.name || cat.category || '',
          productCount: cat.productCount || cat.count || 0,
          status: cat.status || 'Active',
        })) : [];
        setCategories(transformed);
      } catch (error) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(categories.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = useMemo(
    () => categories.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [categories, startIndex]
  );
  const startEntry = categories.length === 0 ? 0 : startIndex + 1;
  const endEntry = categories.length === 0 ? 0 : Math.min(startIndex + ITEMS_PER_PAGE, categories.length);

  const handleCategoryClick = (categoryName: string, e?: React.MouseEvent) => {
    // Prevent click if clicking on action buttons
    if (e && (e.target as HTMLElement).closest('button')) {
      return;
    }
    if (onCategoryClick) {
      onCategoryClick(categoryName);
    } else {
      // Default behavior: navigate to Product List with category filter
      setActivePage('Product List');
      // Store selected category in a way that Products component can access it
      // We'll use App.tsx to manage this state
    }
  };

  const topCards = [
    {title:'In-store Sales', value:'$5,345.43', sub:'5k orders', delta:'+5.7%'},
    {title:'Website Sales', value:'$674,347.12', sub:'21k orders', delta:'+12.4%'},
    {title:'Discount', value:'$14,235.12', sub:'6k orders', delta:''},
    {title:'Affiliate', value:'$8,345.23', sub:'150 orders', delta:'-3.5%'}
  ];

  return (
    <div className="bg-background-light p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {topCards.map((c, idx) => (
          <div key={idx} className="bg-background-dark p-4 rounded-lg">
            <p className="text-sm text-text-secondary">{c.title}</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold text-white">{c.value}</p>
              <span className={`text-xs ${c.delta.startsWith('-') ? 'text-red-400' : 'text-accent-green'}`}>{c.delta}</span>
            </div>
            <p className="text-xs text-text-secondary">{c.sub}</p>
          </div>
        ))}
      </div>
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
            {paginatedCategories.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-text-secondary">
                  No categories found
                </td>
              </tr>
            )}
            {paginatedCategories.map((category) => {
              return (
              <tr
                key={category.id}
                className="border-b border-gray-700 transition-colors hover:bg-gray-800/50 cursor-pointer"
                onClick={(e) => handleCategoryClick(category.name, e)}
              >
                <td className="p-3">
                    <span className="font-semibold text-text-primary hover:text-primary">
                      {category.name}
                    </span>
                </td>
                <td className="p-3 text-text-secondary">{category.productCount}</td>
                <td className="p-3">
                  <Badge color={category.status === 'Active' ? 'green' : 'gray'}>{category.status}</Badge>
                </td>
                <td className="p-3 text-center">
                    <div className="flex justify-center items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button className="text-text-secondary hover:text-primary"><Edit size={16}/></button>
                        <button className="text-text-secondary hover:text-accent-red"><Trash2 size={16}/></button>
                    </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 text-sm text-text-secondary">
          <p>Showing {startEntry} to {endEntry} of {categories.length} entries</p>
          <div className="flex items-center gap-1">
              <button
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                onClick={() => currentPage > 1 && setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded-md ${page === currentPage ? 'bg-primary text-white' : 'hover:bg-gray-700'}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                onClick={() => currentPage < totalPages && setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
          </div>
      </div>
    </div>
  );
};

export default CategoryList;
