import React, { useEffect, useRef, useState } from 'react';
import { ProductsApi } from '../../../../../api/products';
import UploadApi from '../../../../../api/upload';
import { AddProductFormData } from './components/ProductInfoSection';
import AddProductHeader from './components/AddProductHeader';
import ProductInfoSection from './components/ProductInfoSection';
import ImageUploadSection from '../components/ImageUploadSection';
import PricingSection from './components/PricingSection';
import OrganizeSection from './components/OrganizeSection';
import { generateSKU, formatCurrencyInput } from './utils';
import ModalDialog from '../../../../../components/ModalDialog';

type AddProductProps = {
  onBack?: () => void;
  setActivePage?: (page: string) => void;
};

const AddProductPage: React.FC<AddProductProps> = ({ onBack, setActivePage }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const priceInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialog, setDialog] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'danger';
    onConfirm?: () => void;
  } | null>(null);

  const previewFileName = imagePreview?.file?.name || null;
  const previewFileSize = imagePreview?.file?.size || null;

  const [formData, setFormData] = useState<AddProductFormData>({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: '',
    quantity: '',
    status: 'Publish',
    stock: true,
  });

  useEffect(() => {
    if (formData.category && !formData.sku) {
      const newSku = generateSKU(formData.category);
      setFormData((prev) => ({ ...prev, sku: newSku }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageTrigger = () => {
    if (imagePreview || uploading) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setDialog({
        title: 'Invalid file',
        message: 'Please select an image file (PNG, JPG, GIF).',
      });
      return;
    }

    try {
      setUploading(true);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview({ file, url: previewUrl });

      const uploadResponse = await UploadApi.uploadImage(file);

      if (uploadResponse && uploadResponse.success && uploadResponse.data) {
        const cloudinaryUrl = uploadResponse.data.secureUrl || uploadResponse.data.url;
        URL.revokeObjectURL(previewUrl);
        setImagePreview({ file, url: cloudinaryUrl });
      } else {
        throw new Error('Upload failed: Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setDialog({
        title: 'Upload failed',
        message: error?.message || 'Failed to upload image. Please try again.',
      });
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview.url);
      }
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  // Method 3 - Simple controlled input approach
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extract only numeric characters
    const val = e.target.value.replace(/\D/g, '');
    
    // Update state with numeric value only
    setFormData((prev) => ({
      ...prev,
      price: val,
    }));
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

  const handleInputChange = (field: keyof AddProductFormData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === 'category' && value) {
        newData.sku = generateSKU(value);
      }
      return newData;
    });
  };

  const handleGenerateSKU = () => {
    if (formData.category) {
      setFormData((prev) => ({ ...prev, sku: generateSKU(formData.category) }));
    } else {
      setDialog({
        title: 'Select category',
        message: 'Please select a category before generating a SKU.',
      });
    }
  };

  const handleSubmit = async (status: 'Publish' | 'Draft' | 'Inactive') => {
    try {
      if (!formData.name.trim()) {
        setDialog({ title: 'Missing information', message: 'Product name is required.' });
        return;
      }
      if (!formData.category) {
        setDialog({ title: 'Missing information', message: 'Category is required.' });
        return;
      }

      let finalSku = formData.sku.trim();
      if (!finalSku && formData.category) {
        finalSku = generateSKU(formData.category);
        setFormData((prev) => ({ ...prev, sku: finalSku }));
      }

      if (!finalSku) {
        setDialog({ title: 'Missing information', message: 'SKU is required. Please select a category to auto-generate SKU.' });
        return;
      }

      if (!imagePreview) {
        setDialog({ title: 'Missing information', message: 'Product image is required.' });
        return;
      }

      setSaving(true);

      const finalImageUrl = imagePreview.url;
      if (finalImageUrl.startsWith('blob:')) {
        setDialog({ title: 'Upload in progress', message: 'Please wait for the image upload to finish before submitting.' });
        return;
      }

      const payload = {
        name: formData.name.trim(),
        sku: finalSku,
        description: formData.description.trim(),
        category: formData.category,
        imageUrl: finalImageUrl,
        price: Number(formData.price) || 0,
        quantity: Number(formData.quantity) || 0,
        status,
        stock: formData.stock,
      };

      const res = await ProductsApi.create(payload);

      if (res && res.success && res.data) {
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview.url);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));

        if (onBack) {
          onBack();
        } else if (setActivePage) {
          setActivePage('Product List');
        }
      } else {
        throw new Error(res?.message || 'Create failed: Invalid response from server');
      }
      } catch (e: any) {
      console.error('Error creating product:', e);
      const errorMessage = e?.response?.data?.message || e?.message || 'Unknown error';
      setDialog({
        title: 'Failed to create product',
        message: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setDialog({
      title: 'Discard changes',
      message: 'Are you sure you want to discard all changes? This action cannot be undone.',
      confirmLabel: 'Discard',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        setDialog(null);
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
      },
    });
  };

  useEffect(
    () => () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview.url);
      }
    },
    [imagePreview],
  );

  return (
    <div className="space-y-6">
      <AddProductHeader onBack={onBack} saving={saving} onDiscard={handleDiscard} onSubmit={handleSubmit} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProductInfoSection formData={formData} onChange={handleInputChange} onGenerateSKU={handleGenerateSKU} />
          <ImageUploadSection
            imagePreview={imagePreview}
            uploading={uploading}
            isDragActive={isDragActive}
            previewFileName={previewFileName}
            previewFileSize={previewFileSize}
            onTriggerUpload={handleImageTrigger}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onRemoveImage={handleRemoveImage}
            onBrowse={() => handleImageTrigger()}
            onFileChange={(event) => handleFiles(event.target.files)}
            fileInputRef={fileInputRef}
          />
        </div>

        <div className="space-y-6">
          <PricingSection formData={formData} onChange={handleInputChange} onPriceChange={handlePriceInputChange} priceInputRef={priceInputRef} />
          <OrganizeSection formData={formData} onChange={handleInputChange} />
        </div>
      </div>
      <ModalDialog
        isOpen={!!dialog}
        title={dialog?.title || ''}
        message={dialog?.message || ''}
        confirmLabel={dialog?.confirmLabel}
        cancelLabel={dialog?.cancelLabel}
        variant={dialog?.variant}
        onConfirm={() => {
          dialog?.onConfirm?.();
          setDialog(null);
        }}
        onCancel={() => {
          setDialog(null);
        }}
      />
    </div>
  );
};

export default AddProductPage;
