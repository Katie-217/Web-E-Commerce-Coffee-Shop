import React, { useState, useEffect, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import { updateCustomer } from '../../../../../../api/customers';
import { formatMemberSinceDate } from '../../utils/helpers';

type EditUserInformationModalProps = {
  customer: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCustomer: any) => void;
};

const EditUserInformationModal: React.FC<EditUserInformationModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'other',
    avatarUrl: '',
    status: 'active',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fill form with customer data when modal opens or customer changes
  useEffect(() => {
    if (customer && isOpen) {
      const fullName = customer.fullName || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || customer.firstName || '';
      const lastName = nameParts.slice(1).join(' ') || customer.lastName || '';

      // Get country from primary address
      const primaryAddress = customer.addresses?.find((a: any) => a.isDefault) || customer.addresses?.[0];
      const country = primaryAddress?.country || '';

      setFormData({
        firstName,
        lastName,
        email: customer.email || '',
        phone: customer.phone || '',
        gender: customer.gender || 'other',
        avatarUrl: customer.avatarUrl || '',
        status: customer.status || 'active',
        country,
      });
      setError(null);
    }
  }, [customer, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      handleChange('avatarUrl', objectUrl);
      
      // Note: In a real application, you would upload the file to a server
      // and get the URL back. For now, we'll use the object URL as a preview.
      // You may want to implement file upload to your backend.
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare update data based on actual Customer model fields
      const updateData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        gender: formData.gender,
        status: formData.status,
        avatarUrl: formData.avatarUrl.trim() || undefined,
      };


      // Update country in primary address if exists
      if (customer.addresses && customer.addresses.length > 0) {
        const addresses = [...customer.addresses];
        const primaryIndex = addresses.findIndex((a: any) => a.isDefault);
        if (primaryIndex >= 0 && addresses[primaryIndex]) {
          addresses[primaryIndex] = {
            ...addresses[primaryIndex],
            country: formData.country || addresses[primaryIndex].country,
          };
          updateData.addresses = addresses;
        } else if (formData.country) {
          // Update first address if no default
          addresses[0] = {
            ...addresses[0],
            country: formData.country,
          };
          updateData.addresses = addresses;
        }
      } else if (formData.country) {
        // Create new address if none exists
        updateData.addresses = [{
          type: 'shipping',
          isDefault: true,
          country: formData.country,
        }];
      }

      // Call API to update customer
      const customerId = customer._id || customer.id;
      const response = await updateCustomer(customerId, updateData);
      
      if (response?.success) {
        // Call onSave with updated customer data
        onSave(response.data || { ...customer, ...updateData });
        onClose();
      } else {
        setError(response?.message || 'Failed to update customer');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background-light rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Edit User Information</h2>
            <p className="text-sm text-text-secondary mt-1">
              Updating user details will receive a privacy audit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Avatar Preview */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={formData.avatarUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(formData.email || '')}`}
                alt="Avatar preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-600"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://i.pravatar.cc/150?u=${encodeURIComponent(formData.email || '')}`;
                }}
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 p-2 bg-primary rounded-full border-2 border-background-light hover:bg-primary/90 transition-colors"
                aria-label="Change avatar"
              >
                <Camera size={16} className="text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-bold text-text-primary">{customer?.fullName || 'Customer'}</h3>
              <p className="text-sm text-text-secondary mt-1">
                Customer ID {(() => {
                  const s = String(customer?._id || customer?.id || '');
                  if (!s) return '';
                  const hex = s.replace(/[^a-fA-F0-9]/g, '') || s;
                  const last4 = hex.slice(-4).padStart(4, '0');
                  return `#${last4}`;
                })()}
              </p>
              {customer?.createdAt && (
                <p className="text-xs text-text-secondary mt-1">
                  Member since {formatMemberSinceDate(customer.createdAt || customer.joinedAt)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Row 1: First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary h-10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary h-10"
                  required
                />
              </div>
            </div>

            {/* Row 2: Email & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary h-10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary h-10"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Row 3: Phone Number & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary h-10"
                  placeholder="+84 123 456 789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Status <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary h-10"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>

            {/* Row 4: Country (full width or centered) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary h-10"
                >
                  <option value="">Select Country</option>
                  <option value="VN">Vietnam</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="IN">India</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
              <div></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-background-dark text-text-secondary rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserInformationModal;

