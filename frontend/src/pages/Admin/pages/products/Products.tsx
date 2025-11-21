/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProductStatus, Product } from '../../types';
import { ProductsApi } from '../../../../api/products';
import Badge from '../../components/Badge';
import { formatVND } from '../../../../utils/currency';
import ProductForm, { ProductFormValues } from './components/ProductForm';
import { Plus, MoreVertical, Edit, Trash2, ChevronDown, Printer, FileDown, FileSpreadsheet, FileText, Copy as CopyIcon } from 'lucide-react';

const ITEMS_PER_PAGE = 10;
const API_FETCH_LIMIT = 1000;

type ProductsProps = {
  setActivePage: (page: string) => void;
  selectedCategory?: string | null;
  onClearSelectedCategory?: () => void;
  embedded?: boolean;
};

  const Products: React.FC<ProductsProps> = ({ setActivePage, selectedCategory = null, onClearSelectedCategory, embedded = false }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showExport, setShowExport] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<string>(selectedCategory || '');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<string>('');
  const exportRef = useRef<HTMLDivElement>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching products from API...');
        const response = await ProductsApi.list({ limit: API_FETCH_LIMIT, page: 1 });
        console.log('📦 API Response:', response);
        if (response && response.success && response.data) {
          console.log(`✅ Loaded ${response.data.length} products`);
          setProducts(response.data);
        } else {
          console.error('❌ Invalid response format:', response);
          setError('Failed to fetch products - Invalid response format');
        }
      } catch (err: any) {
        console.error('❌ Error fetching products:', err);
        console.error('❌ Error details:', {
          message: err.message,
          status: err.status,
          data: err.data
        });
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => products.some((product) => product.id === id)));
  }, [products]);

  const itemsPerPage = ITEMS_PER_PAGE;

  const filteredProducts = useMemo(() => {
    // Use categoryFilter from dropdown if available, otherwise use selectedCategory prop
    const activeCategory = categoryFilter || selectedCategory;
    
    return products.filter((product) => {
      // Filter by category
      if (activeCategory && product.category !== activeCategory) {
        return false;
      }
      
      // Filter by status
      if (statusFilter && product.status !== statusFilter) {
        return false;
      }
      
      // Filter by stock
      if (stockFilter) {
        const isInStock = product.stock === true;
        if (stockFilter === 'in_stock' && !isInStock) {
          return false;
        }
        if (stockFilter === 'out_of_stock' && isInStock) {
          return false;
        }
      }
      
      return true;
    });
  }, [products, selectedCategory, categoryFilter, statusFilter, stockFilter]);

  useEffect(() => {
    setCurrentPage(1);
    // Update category filter when selectedCategory changes
    if (selectedCategory) {
      setCategoryFilter(selectedCategory);
    } else if (!selectedCategory && categoryFilter) {
      // Clear category filter when selectedCategory is cleared
      setCategoryFilter('');
    }
  }, [selectedCategory]);

  useEffect(() => {
    const total = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
    if (currentPage > total) {
      setCurrentPage(total);
    }
  }, [filteredProducts.length, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  const startEntry = filteredProducts.length === 0 ? 0 : startIndex + 1;
  const endEntry = filteredProducts.length === 0 ? 0 : Math.min(startIndex + itemsPerPage, filteredProducts.length);
  const pageIds = paginatedProducts.map((product) => product.id);
  const allChecked = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const noneChecked = selectedIds.length === 0;

  function toggleAll() {
    setSelectedIds((prev) =>
      allChecked
        ? prev.filter((id) => !pageIds.includes(id))
        : [...prev, ...pageIds.filter((id) => !prev.includes(id))]
    );
  }
  function toggleOne(id: number) {
    setSelectedIds((selected) =>
      selected.includes(id)
        ? selected.filter((i) => i !== id)
        : [...selected, id]
    );
  }

  // Open Edit Dialog
  function onOpenEdit(p: Product) {
    setEditProduct(p);
    setIsEditOpen(true);
  }

  // Save Edit - Update product in MongoDB
  async function onSaveEdit() {
    if (!editProduct) return;
    try {
      setSaving(true);
      console.log('🔄 Updating product:', editProduct.id);
      
      const payload = {
        name: editProduct.name,
        imageUrl: (editProduct as any).imageUrl,
        sku: (editProduct as any).sku,
        category: (editProduct as any).category,
        description: (editProduct as any).description || '',
        price: Number((editProduct as any).price) || 0,
        quantity: Number((editProduct as any).quantity) || 0,
        status: (editProduct as any).status,
        stock: (editProduct as any).stock,
      } as any;
      
      console.log('📦 Payload:', payload);
      
      // Call API to update product in MongoDB
      const res = await ProductsApi.update(editProduct.id, payload);
      
      if (res && res.success && res.data) {
        console.log('✅ Product updated successfully in MongoDB:', res.data);
        
        // Update local state with data from MongoDB
        setProducts(prev => prev.map(p => 
          p.id === editProduct.id ? { ...p, ...res.data } : p
        ));
        
        setIsEditOpen(false);
        setEditProduct(null);
      } else {
        throw new Error('Update failed: Invalid response from server');
      }
    } catch (e: any) {
      console.error('❌ Save product failed:', e);
      alert(`Save failed: ${e.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.Publish:
        return 'green';
      case ProductStatus.Inactive:
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <div className={embedded ? 'space-y-6' : 'bg-background-light p-6 rounded-lg shadow-lg'}>
      
      {!embedded && (
        <div className="w-full flex flex-col gap-4 mb-2">
          <p className="text-sm text-text-secondary">Filter</p>
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <select 
              className={`bg-background-light border border-gray-700 rounded-lg px-3 py-2 flex-1 min-w-[120px] ${
                statusFilter ? 'text-text-primary' : 'text-text-secondary'
              }`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Status</option>
              <option value="Publish">Publish</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select 
              className={`bg-background-light border border-gray-700 rounded-lg px-3 py-2 flex-1 min-w-[120px] ${
                categoryFilter ? 'text-text-primary' : 'text-text-secondary'
              }`}
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                if (e.target.value === '' && onClearSelectedCategory) {
                  onClearSelectedCategory();
                }
              }}
            >
              <option value="">Category</option>
              <option value="Roasted coffee">Roasted coffee</option>
              <option value="Coffee sets">Coffee sets</option>
              <option value="Cups & Mugs">Cups & Mugs</option>
              <option value="Coffee makers and grinders">Coffee makers and grinders</option>
            </select>
            <select 
              className={`bg-background-light border border-gray-700 rounded-lg px-3 py-2 flex-1 min-w-[120px] ${
                stockFilter ? 'text-text-primary' : 'text-text-secondary'
              }`}
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="">Stock</option>
              <option value="in_stock">In stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </div>
        </div>
      )}
      <div className="border-b border-gray-700 w-full mb-4 mt-2"></div>
      {!embedded && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          
          <div className="flex-1">
            <input type="text" placeholder="Search Product" className="bg-background-light border border-gray-700 rounded-lg px-3 py-2 w-full max-w-xs"/>
          </div>
          
          <div className="flex flex-row items-center gap-2 flex-wrap justify-end">
            <select className="bg-background-light border border-gray-700 rounded-lg px-2 py-2 text-text-secondary w-16">
              <option>7</option>
            </select>
            <div className="relative" ref={exportRef}>
              <button type="button" disabled={noneChecked} onClick={() => !noneChecked && setShowExport(v=>!v)}
                className={`bg-background-light border border-gray-700 text-text-secondary px-4 py-2 rounded-lg flex items-center gap-2 ${noneChecked ? 'opacity-50 cursor-not-allowed' : 'hover:text-white hover:border-primary'}`}>
                <span>Export</span>
                <ChevronDown size={16}/>
              </button>
              {showExport && !noneChecked && (
                <div className="absolute right-0 mt-2 w-44 bg-background-light border border-gray-700 rounded-lg shadow-xl z-10 p-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"><Printer size={16}/> Print</button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"><FileDown size={16}/> Csv</button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"><FileSpreadsheet size={16}/> Excel</button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"><FileText size={16}/> Pdf</button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"><CopyIcon size={16}/> Copy</button>
                </div>
              )}
            </div>
            <button className="bg-primary text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
              onClick={() => setActivePage('Add Product')}>
              <Plus size={18}/>
              Add Product
            </button>
          </div>
        </div>
      )}
      
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 text-sm text-text-secondary">
                <th className="p-3"><input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all products"/></th>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Stock</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Price</th>
                <th className="p-3">QTY</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-text-secondary">
                    Loading products...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-red-400">
                    Error: {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-text-secondary">
                    {selectedCategory ? `No products found in category "${selectedCategory}"` : 'No products found'}
                  </td>
                </tr>
              )}
              {!loading && !error && filteredProducts.length > 0 && paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-text-secondary">
                    No products on this page
                  </td>
                </tr>
              )}
              {!loading && !error && paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                  <td className="p-3">
                    <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleOne(product.id)} aria-label={`Select product ${product.name}`}/>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                      <div>
                          <p className="font-semibold text-text-primary">{product.name}</p>
                          <p className="text-xs text-text-secondary">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-text-secondary">{product.category}</td>
                  <td className="p-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={product.stock}
                          onChange={async (e) => {
                            try {
                              const newStockValue = e.target.checked;
                              console.log(`🔄 Updating stock for product ${product.id}: ${newStockValue}`);
                              
                              // Update stock in MongoDB
                              const res = await ProductsApi.update(product.id, { stock: newStockValue });
                              
                              if (res && res.success && res.data) {
                                console.log('✅ Stock updated successfully in MongoDB');
                                // Update local state
                                setProducts(prev => prev.map(p => 
                                  p.id === product.id ? { ...p, stock: newStockValue } : p
                                ));
                              } else {
                                throw new Error('Update failed');
                              }
                            } catch (error: any) {
                              console.error('❌ Failed to update stock:', error);
                              alert(`Failed to update stock: ${error.message || 'Unknown error'}`);
                              // Revert checkbox state on error
                              e.target.checked = !e.target.checked;
                            }
                          }}
                        />
                        <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-primary transition"></div>
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                      </label>
                  </td>
                  <td className="p-3 text-text-secondary">{product.sku}</td>
                  <td className="p-3 text-text-primary font-medium">{formatVND(product.price)}</td>
                  <td className="p-3 text-text-secondary">{product.quantity}</td>
                  <td className="p-3">
                    <Badge color={getStatusColor(product.status)}>{product.status}</Badge>
                  </td>
                  <td className="p-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                          <button className="text-text-secondary hover:text-primary" onClick={() => onOpenEdit(product)}><Edit size={16}/></button>
                          <button className="text-text-secondary hover:text-accent-red"><Trash2 size={16}/></button>
                          <button className="text-text-secondary hover:text-white"><MoreVertical size={16}/></button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex justify-between items-center mt-6 text-sm text-text-secondary">
            <p>Showing {startEntry} to {endEntry} of {filteredProducts.length} entries</p>
            <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => currentPage > 1 && setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md ${
                      page === currentPage ? 'bg-primary text-white' : 'hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => currentPage < totalPages && setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                >
                  Next
                </button>
            </div>
          </div>
        </div>
      
      {/* Edit Dialog */}
      {isEditOpen && editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background-light w-full max-w-xl rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Edit Product</h3>
              <button className="text-text-secondary hover:text-white" onClick={() => { setIsEditOpen(false); setEditProduct(null); }}>✕</button>
            </div>
            <ProductForm
              initialValues={{
                name: editProduct.name,
                sku: (editProduct as any).sku,
                imageUrl: (editProduct as any).imageUrl,
                description: (editProduct as any).description,
                category: (editProduct as any).category,
                price: (editProduct as any).price,
                quantity: (editProduct as any).quantity,
                status: (editProduct as any).status as any,
                stock: (editProduct as any).stock,
              }}
              saving={saving}
              title="Product"
              onCancel={() => { setIsEditOpen(false); setEditProduct(null); }}
              onSubmit={async (values: ProductFormValues) => {
                try {
                  setSaving(true);
                  console.log('🔄 Updating product via form:', editProduct.id);
                  console.log('📦 Form values:', values);
                  
                  // Call API to update product in MongoDB
                  const res = await ProductsApi.update(editProduct.id, values as any);
                  
                  if (res && res.success && res.data) {
                    console.log('✅ Product updated successfully in MongoDB:', res.data);
                    
                    // Update local state with data from MongoDB
                    setProducts(prev => prev.map(p => 
                      p.id === editProduct.id ? { ...p, ...res.data } : p
                    ));
                    
                    setIsEditOpen(false);
                    setEditProduct(null);
                  } else {
                    throw new Error('Update failed: Invalid response from server');
                  }
                } catch (e: any) {
                  console.error('❌ Save product failed:', e);
                  alert(`Save failed: ${e.message || 'Unknown error'}`);
                } finally {
                  setSaving(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
