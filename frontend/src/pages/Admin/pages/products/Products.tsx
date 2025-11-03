/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { MOCK_PRODUCTS } from '../../constants';
import { ProductStatus } from '../../types';
import Badge from '../../components/Badge';
import { Plus, MoreVertical, Edit, Trash2, ChevronDown, Printer, FileDown, FileSpreadsheet, FileText, Copy as CopyIcon } from 'lucide-react';

type ProductsProps = {
  setActivePage: (page: string) => void;
};

const Products: React.FC<ProductsProps> = ({ setActivePage }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const allChecked = selectedIds.length === MOCK_PRODUCTS.length && MOCK_PRODUCTS.length > 0;
  const noneChecked = selectedIds.length === 0;

  function toggleAll() {
    if (allChecked) setSelectedIds([]);
    else setSelectedIds(MOCK_PRODUCTS.map(p => p.id));
  }
  function toggleOne(id: number) {
    setSelectedIds((selected) =>
      selected.includes(id)
        ? selected.filter((i) => i !== id)
        : [...selected, id]
    );
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
      
      <div className="w-full flex flex-col gap-4 mb-2">
        <p className="text-sm text-text-secondary">Filter</p>
        <div className="flex flex-col md:flex-row gap-3 w-full">
          <select className="bg-background-light border border-gray-700 rounded-lg px-3 py-2 text-text-secondary flex-1 min-w-[120px]">
            <option>Status</option>
          </select>
          <select className="bg-background-light border border-gray-700 rounded-lg px-3 py-2 text-text-secondary flex-1 min-w-[120px]">
            <option>Category</option>
          </select>
          <select className="bg-background-light border border-gray-700 rounded-lg px-3 py-2 text-text-secondary flex-1 min-w-[120px]">
            <option>Stock</option>
          </select>
        </div>
      </div>
      <div className="border-b border-gray-700 w-full mb-4 mt-2"></div>
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
              {MOCK_PRODUCTS.map((product) => (
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
                        <input type="checkbox" className="sr-only peer" defaultChecked={product.stock} />
                        <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-primary transition"></div>
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                      </label>
                  </td>
                  <td className="p-3 text-text-secondary">{product.sku}</td>
                  <td className="p-3 text-text-primary font-medium">${product.price.toFixed(2)}</td>
                  <td className="p-3 text-text-secondary">{product.quantity}</td>
                  <td className="p-3">
                    <Badge color={getStatusColor(product.status)}>{product.status}</Badge>
                  </td>
                  <td className="p-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                          <button className="text-text-secondary hover:text-primary"><Edit size={16}/></button>
                          <button className="text-text-secondary hover:text-accent-red"><Trash2 size={16}/></button>
                          <button className="text-text-secondary hover:text-white"><MoreVertical size={16}/></button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex justify-between items-center mt-6 text-sm text-text-secondary">
            <p>Showing 1 to {MOCK_PRODUCTS.length} of {MOCK_PRODUCTS.length} entries</p>
            <div className="flex items-center gap-1">
                <button className="px-3 py-1 rounded-md hover:bg-gray-700">Previous</button>
                <button className="px-3 py-1 rounded-md bg-primary text-white">1</button>
                <button className="px-3 py-1 rounded-md hover:bg-gray-700">2</button>
                <button className="px-3 py-1 rounded-md hover:bg-gray-700">3</button>
                <button className="px-3 py-1 rounded-md hover:bg-gray-700">Next</button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Products;
