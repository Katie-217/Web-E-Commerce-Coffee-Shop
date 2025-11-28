import React, { useEffect, useRef, useState } from 'react';
import BackButton from '../../components/BackButton';
import { ProductsApi } from '../../../../api/products';
import { formatVND } from '../../../../utils/currency';
import { UploadCloud, X } from 'lucide-react';

type ProductPrefill = Partial<
  Omit<ProductFormState, 'price' | 'quantity'> & {
    price?: string | number;
    quantity?: string | number;
    id?: string | number;
    _id?: string;
  }
>;

type ProductDetailProps = {
  productId: string | number | null;
  onBack: () => void;
  initialProduct?: ProductPrefill;
};

type ProductFormState = {
  name: string;
  sku: string;
  description: string;
  category: string;
  price: string;
  quantity: string;
  status: 'Publish' | 'Inactive' | 'Draft';
  stock: boolean;
  imageUrl: string;
};

const initialState: ProductFormState = {
  name: '',
  sku: '',
  description: '',
  category: '',
  price: '',
  quantity: '',
  status: 'Publish',
  stock: true,
  imageUrl: '',
};

const toInputString = (value: unknown) =>
  value === undefined || value === null || value === '' ? '' : String(value);

const normalizeProductData = (product?: ProductPrefill): ProductFormState => ({
  name: product?.name || '',
  sku: product?.sku || '',
  description: product?.description || '',
  category: product?.category || '',
  price: toInputString(product?.price),
  quantity: toInputString(product?.quantity),
  status: (product?.status as ProductFormState['status']) || 'Publish',
  stock: product?.stock ?? true,
  imageUrl: (product?.imageUrl as string) || (product as any)?.image || '',
});

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack, initialProduct }) => {
  const [productData, setProductData] = useState<ProductFormState>(() =>
    normalizeProductData(initialProduct),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<{ file?: File; url: string } | null>(() =>
    productData.imageUrl ? { url: productData.imageUrl } : null,
  );
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview.url);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (initialProduct) {
      setProductData(normalizeProductData(initialProduct));
      if (initialProduct.imageUrl) {
        setImagePreview({ url: initialProduct.imageUrl as string });
      }
      setError(null);
    }
  }, [initialProduct]);

  useEffect(() => {
    if (!productId) {
      if (!initialProduct) {
        setError('Product not found');
      } else {
        setError(null);
      }
      return;
    }

    let cancelled = false;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await ProductsApi.get(productId);
        const product: ProductPrefill | null =
          (res?.data as ProductPrefill) || (res?.item as ProductPrefill) || (res as ProductPrefill);
        if (!product) {
          throw new Error('Product data not found');
        }

        if (cancelled) return;
        const normalized = normalizeProductData(product);
        setProductData(normalized);
        if (normalized.imageUrl) {
          setImagePreview({ url: normalized.imageUrl });
        } else {
          setImagePreview(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          if (initialProduct) {
            setError(null);
            const normalized = normalizeProductData(initialProduct);
            setProductData(normalized);
            if (normalized.imageUrl) {
              setImagePreview({ url: normalized.imageUrl });
            }
          } else {
            setError(err?.message || 'Unable to load product data');
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [productId, initialProduct]);

  const handleFieldChange = (field: keyof ProductFormState, value: string | boolean) => {
    setProductData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageTrigger = () => {
    if (imagePreview) {
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    const url = URL.createObjectURL(file);
    if (imagePreview?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview.url);
    }
    setImagePreview({ file, url });
    setProductData((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    if (imagePreview) {
      return;
    }
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = () => {
    if (isDragActive) setIsDragActive(false);
  };

  const handleRemoveImage = () => {
    if (imagePreview?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview.url);
    }
    setImagePreview(null);
    setProductData((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!productId) {
      setError('Cannot update without a product ID');
      return;
    }

    try {
      setSaving(true);
      setSuccessMessage(null);
      setError(null);

      const payload = {
        name: productData.name.trim(),
        sku: productData.sku.trim(),
        description: productData.description.trim(),
        category: productData.category.trim(),
        price: Number(productData.price) || 0,
        quantity: Number(productData.quantity) || 0,
        status: productData.status,
        stock: productData.stock,
        imageUrl: productData.imageUrl,
      };

      const res = await ProductsApi.update(productId, payload as any);
      if (res && res.success && res.data) {
        setProductData(
          normalizeProductData({
            ...payload,
            imageUrl: res.data.imageUrl || payload.imageUrl,
          }),
        );
        setSuccessMessage('Product updated successfully!');
      } else {
        throw new Error('Unable to update product');
      }
    } catch (updateError: any) {
      setError(updateError?.message || 'Unable to update product');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (
    label: string,
    value: string,
    {
      required = false,
      type = 'text',
      multiline = false,
      onChange,
    }: {
      required?: boolean;
      type?: string;
      multiline?: boolean;
      onChange?: (value: string) => void;
    } = {},
  ) => (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          rows={6}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={!onChange}
          className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={!onChange}
          className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
        />
      )}
    </div>
  );

  const formattedPrice = productData.price ? formatVND(Number(productData.price)) : formatVND(0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <BackButton onClick={onBack} className="w-fit" />
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Product Detail</h2>
            <p className="text-sm text-text-secondary mt-1 opacity-70">
              Detailed product information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !productId}
            className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Update product'}
          </button>
        </div>
      </div>

      <div className="bg-background-light p-4 rounded-lg border border-gray-700 text-sm space-y-2">
        {successMessage && (
          <p className="text-sm text-green-400 font-medium">{successMessage}</p>
        )}
        {loading && <p className="text-text-secondary">Loading product data...</p>}
        {!loading && error && <p className="text-red-400">{error}</p>}
        {!loading && !error && (
          <div className="text-text-secondary flex flex-wrap gap-6">
            <div>
              <span className="text-text-primary font-semibold">Product name:</span>{' '}
              {productData.name || '—'}
            </div>
            <div>
              <span className="text-text-primary font-semibold">SKU:</span>{' '}
              {productData.sku || '—'}
            </div>
            <div>
              <span className="text-text-primary font-semibold">Price:</span>{' '}
              {productData.price ? formatVND(Number(productData.price)) : '—'}
            </div>
            <div>
              <span className="text-text-primary font-semibold">Stock:</span>{' '}
              {productData.stock ? 'Available' : 'Out of stock'}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background-light p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">
              Product Information
            </h3>
            <div className="space-y-4">
              {renderField('Name', productData.name, {
                required: true,
                onChange: (value) => handleFieldChange('name', value),
              })}
              {renderField('SKU', productData.sku, {
                required: true,
                onChange: (value) => handleFieldChange('sku', value),
              })}
              {renderField('Description', productData.description, {
                multiline: true,
                onChange: (value) => handleFieldChange('description', value),
              })}
            </div>
          </div>

          <div className="bg-background-light p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">
              Product Image
            </h3>
            <div
              className={`group border-2 border-dashed rounded-lg p-6 sm:p-10 transition-all duration-300 ${
                imagePreview
                  ? 'border-gray-600 text-left cursor-default'
                  : isDragActive
                    ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20 text-center cursor-pointer'
                    : 'border-gray-600 hover:border-primary hover:bg-primary/5 hover:shadow-md text-center cursor-pointer'
              }`}
              onClick={handleImageTrigger}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {imagePreview ? (
                <div className="max-w-xs bg-background-dark/50 border border-gray-700 rounded-lg overflow-hidden relative">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                  <div className="aspect-square bg-background-dark">
                    <img
                      src={imagePreview.url}
                      alt={productData.name || imagePreview.file?.name || 'Product image'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {imagePreview.file?.name || productData.name || 'Image'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-500 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <p className="mt-4 text-text-secondary opacity-70 transition-opacity duration-300 group-hover:opacity-100">
                    Drag and drop your image here
                  </p>
                  <p className="text-xs text-gray-500 opacity-70">or</p>
                  <button
                    type="button"
                    className="group/btn relative inline-flex items-center gap-2 px-4 py-2 mt-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleImageTrigger();
                    }}
                  >
                    <span>Browse image</span>
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-background-light p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Inventory</h3>
            <div className="space-y-4">
              {renderField('Quantity', productData.quantity, {
                required: true,
                type: 'number',
                onChange: (value) => handleFieldChange('quantity', value),
              })}
            </div>
          </div>

          <div className="bg-background-light p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Pricing</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                {renderField('Price', productData.price, {
                  required: true,
                  type: 'number',
                  onChange: (value) => handleFieldChange('price', value),
                })}
                <p className="text-xs text-text-secondary">Formatted: {formattedPrice}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">In stock</span>
                <label className="relative inline-flex items-center cursor-default">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={productData.stock}
                    onChange={(e) => handleFieldChange('stock', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-primary">
                    <div
                      className={`h-5 w-5 bg-white rounded-full mt-0.5 ml-0.5 transition-transform ${
                        productData.stock ? 'translate-x-5' : ''
                      }`}
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-background-light p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Organize</h3>
            <div className="space-y-4">
              {renderField('Category', productData.category, {
                onChange: (value) => handleFieldChange('category', value),
              })}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Status
                </label>
                <select
                  value={productData.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Publish">Publish</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

