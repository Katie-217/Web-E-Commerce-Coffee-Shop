import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, Trash2 } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { ProductsApi } from '../../../../api/products';

const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

type AddProductProps = {
    onBack?: () => void;
    setActivePage?: (page: string) => void;
};

const AddProduct: React.FC<AddProductProps> = ({ onBack, setActivePage }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Form state based on Product model
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        category: '',
        price: '',
        quantity: '',
        status: 'Publish' as 'Publish' | 'Inactive' | 'Draft',
        stock: true,
    });

    const handleImageTrigger = () => {
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
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview.url);
        }
        setImagePreview({ file, url });
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragActive(false);
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
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview.url);
        }
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (status: 'Publish' | 'Draft' | 'Inactive') => {
        try {
            // Validate required fields
            if (!formData.name.trim()) {
                alert('Product name is required');
                return;
            }
            if (!formData.sku.trim()) {
                alert('SKU is required');
                return;
            }
            if (!formData.category) {
                alert('Category is required');
                return;
            }
            if (!imagePreview) {
                alert('Product image is required');
                return;
            }

            setSaving(true);
            console.log('🆕 Creating new product in MongoDB');

            // Prepare image URL - for now use a placeholder
            // In production, upload to Firebase/Cloudinary first
            let finalImageUrl = imagePreview.url;
            console.warn('⚠️ Using local file URL. In production, upload to cloud storage first.');

            const payload = {
                name: formData.name.trim(),
                sku: formData.sku.trim(),
                description: formData.description.trim(),
                category: formData.category,
                imageUrl: finalImageUrl,
                price: Number(formData.price) || 0,
                quantity: Number(formData.quantity) || 0,
                status: status,
                stock: formData.stock,
            };

            console.log('📦 Payload:', payload);

            // Create product in MongoDB
            const res = await ProductsApi.create(payload);

            if (res && res.success && res.data) {
                console.log('✅ Product created successfully in MongoDB:', res.data);
                alert('Product created successfully!');
                
                // Navigate back to product list
                if (onBack) {
                    onBack();
                } else if (setActivePage) {
                    setActivePage('Product List');
                }
            } else {
                throw new Error('Create failed: Invalid response from server');
            }
        } catch (e: any) {
            console.error('❌ Create product failed:', e);
            alert(`Failed to create product: ${e.message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        if (window.confirm('Are you sure you want to discard all changes?')) {
            setFormData({
                name: '',
                sku: '',
                description: '',
                category: '',
                price: '',
                quantity: '',
                status: 'Publish',
                stock: true,
            });
            handleRemoveImage();
        }
    };

    useEffect(() => () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview.url);
        }
    }, [imagePreview]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                    {onBack && <BackButton onClick={onBack} className="w-fit" />}
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Add a new Product</h2>
                        <p className="text-sm text-text-secondary mt-1 opacity-70">Create a new product in your store</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleDiscard}
                        className="bg-background-light text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        disabled={saving}
                    >
                        Discard
                    </button>
                    <button 
                        onClick={() => handleSubmit('Draft')}
                        className="bg-background-light text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save draft'}
                    </button>
                    <button 
                        onClick={() => handleSubmit('Publish')}
                        className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        disabled={saving}
                    >
                        {saving ? 'Publishing...' : 'Publish product'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Product Information */}
                    <div className="bg-background-light p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-text-primary">Product Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="product-name" className="block text-sm font-medium text-text-secondary mb-1">
                                    Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="product-name"
                                    placeholder="Product title"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="sku" className="block text-sm font-medium text-text-secondary mb-1">
                                    SKU <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="sku"
                                    placeholder="SKU"
                                    value={formData.sku}
                                    onChange={(e) => handleInputChange('sku', e.target.value)}
                                    className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    id="description"
                                    rows={6}
                                    placeholder="Product Description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Image */}
                    <div className="bg-background-light p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-text-primary">
                            Product Image <span className="text-red-400">*</span>
                        </h3>
                        <div
                                className={`border-2 border-dashed rounded-lg p-6 sm:p-10 transition-colors cursor-pointer ${
                                    isDragActive ? 'border-primary bg-primary/5' : 'border-gray-600 hover:border-primary'
                                } ${imagePreview ? 'text-left' : 'text-center'}`}
                                onClick={handleImageTrigger}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                {imagePreview ? (
                                    <div className="max-w-xs bg-background-dark/50 border border-gray-700 rounded-lg overflow-hidden">
                                        <div className="aspect-square bg-background-dark">
                                            <img
                                                src={imagePreview.url}
                                                alt={imagePreview.file.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-3 space-y-1">
                                            <p className="text-sm font-semibold text-text-primary truncate">{imagePreview.file.name}</p>
                                            <p className="text-xs text-text-secondary">{formatFileSize(imagePreview.file.size)}</p>
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleRemoveImage();
                                                }}
                                                className="flex items-center gap-2 text-xs font-medium text-accent-red hover:underline"
                                            >
                                                <Trash2 size={14} />
                                                Remove file
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                                        <p className="mt-4 text-text-secondary opacity-70">Drag and drop your image here</p>
                                        <p className="text-xs text-gray-500 opacity-70">or</p>
                                        <button
                                            type="button"
                                            className="text-sm font-semibold text-primary hover:underline mt-1"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleImageTrigger();
                                            }}
                                        >
                                            Browse image
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

                    {/* Inventory */}
                    <div className="bg-background-light p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-text-primary">Inventory</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-text-secondary mb-1">
                                    Quantity <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    min={0}
                                    placeholder="0"
                                    value={formData.quantity}
                                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                                    className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className="space-y-6">
                    {/* Pricing */}
                    <div className="bg-background-light p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-text-primary">Pricing</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-text-secondary mb-1">
                                    Price <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    min={0}
                                    step="0.01"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-text-primary">In stock</span>
                                <label htmlFor="stock-toggle" className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="stock-toggle"
                                        className="sr-only peer"
                                        checked={formData.stock}
                                        onChange={(e) => handleInputChange('stock', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Organize */}
                    <div className="bg-background-light p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-text-primary">Organize</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-1">
                                    Category <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                        className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary appearance-none"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Roasted coffee">Roasted coffee</option>
                                        <option value="Coffee sets">Coffee sets</option>
                                        <option value="Cups & Mugs">Cups & Mugs</option>
                                        <option value="Coffee makers and grinders">Coffee makers and grinders</option>
                                    </select>
                                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-1">
                                    Status <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => handleInputChange('status', e.target.value as 'Publish' | 'Inactive' | 'Draft')}
                                        className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary appearance-none"
                                        required
                                    >
                                        <option value="Publish">Publish</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
