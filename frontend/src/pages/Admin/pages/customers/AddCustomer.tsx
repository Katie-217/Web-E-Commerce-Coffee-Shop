import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, UploadCloud, ChevronDown } from 'lucide-react';
import { createCustomer } from '../../../../api/customers';
import { COUNTRY_CODE_MAP } from './constants/countries';
import CountrySelect from './components/shared/CountrySelect';
import JoinDatePicker from './components/shared/JoinDatePicker';

// Phone country codes
const PHONE_COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+84', country: 'VN', flag: '🇻🇳' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
  { code: '+65', country: 'SG', flag: '🇸🇬' },
  { code: '+60', country: 'MY', flag: '🇲🇾' },
  { code: '+66', country: 'TH', flag: '🇹🇭' },
  { code: '+62', country: 'ID', flag: '🇮🇩' },
  { code: '+63', country: 'PH', flag: '🇵🇭' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+64', country: 'NZ', flag: '🇳🇿' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+31', country: 'NL', flag: '🇳🇱' },
  { code: '+46', country: 'SE', flag: '🇸🇪' },
  { code: '+47', country: 'NO', flag: '🇳🇴' },
  { code: '+45', country: 'DK', flag: '🇩🇰' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
  { code: '+52', country: 'MX', flag: '🇲🇽' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+966', country: 'SA', flag: '🇸🇦' },
];

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

type AddCustomerProps = {
  onBack?: () => void;
  setActivePage?: (page: string) => void;
};

const AddCustomer: React.FC<AddCustomerProps> = ({ onBack, setActivePage }) => {
  const [saving, setSaving] = useState(false);
  const [useAsBilling, setUseAsBilling] = useState(true);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<{ file: File; url: string } | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<Array<{
    type: 'cash' | 'card' | 'bank';
    isDefault: boolean;
    provider?: string;
    accountNumber?: string;
    accountName?: string;
    brand?: string;
    last4?: string;
  }>>([]);

  const [phoneCountryCode, setPhoneCountryCode] = useState('+84');
  const [phoneCodeMenuOpen, setPhoneCodeMenuOpen] = useState(false);
  const phoneCodeDropdownRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '' as '' | 'male' | 'female' | 'other',
    dateOfBirth: '',
    status: '' as '' | 'active' | 'inactive' | 'banned',
    
    // Shipping Information
    addressLine1: '',
    addressLine2: '',
    ward: '',
    district: '',
    city: '',
    provinceCode: '',
    country: '',
  });

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (phoneCodeDropdownRef.current && !phoneCodeDropdownRef.current.contains(e.target as Node)) {
        setPhoneCodeMenuOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const convertDateToISO = (dateStr: string): string | undefined => {
    if (!dateStr) return undefined;
    // Convert from mm/dd/yyyy to yyyy-mm-dd
    const [mm, dd, yyyy] = dateStr.split('/');
    if (mm && dd && yyyy) {
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
    // If already in ISO format or other format, try to parse it
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Invalid date
    }
    return undefined;
  };

  const handleAvatarTrigger = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    const url = URL.createObjectURL(file);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview.url);
    }
    setAvatarPreview({ file, url });
  };

  const handleAvatarDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    handleAvatarFiles(event.dataTransfer.files);
  };

  const handleAvatarDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleAvatarDragLeave = () => {
    if (isDragActive) setIsDragActive(false);
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview.url);
    }
    setAvatarPreview(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleAddPaymentMethod = () => {
    setPaymentMethods(prev => [...prev, {
      type: 'cash',
      isDefault: prev.length === 0,
      provider: '',
      accountNumber: '',
      accountName: '',
      brand: '',
      last4: '',
    }]);
  };

  const handleRemovePaymentMethod = (index: number) => {
    setPaymentMethods(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaymentMethodChange = (index: number, field: string, value: any) => {
    setPaymentMethods(prev => prev.map((pm, i) => {
      if (i === index) {
        const updated = { ...pm, [field]: value };
        // If setting as default, unset others
        if (field === 'isDefault' && value === true) {
          return updated;
        }
        // Auto-extract last4 from accountNumber if it's a number
        if (field === 'accountNumber' && value && /^\d+$/.test(value)) {
          updated.last4 = value.slice(-4);
        }
        return updated;
      }
      // Unset other defaults if this one is being set as default
      if (field === 'isDefault' && value === true) {
        return { ...pm, isDefault: false };
      }
      return pm;
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.firstName.trim()) {
        alert('First name is required');
        return;
      }
      if (!formData.lastName.trim()) {
        alert('Last name is required');
        return;
      }
      if (!formData.email.trim()) {
        alert('Email is required');
        return;
      }
      if (!formData.addressLine1.trim()) {
        alert('Address Line 1 is required');
        return;
      }
      if (!formData.city.trim()) {
        alert('City is required');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }

      setSaving(true);

      // Prepare customer data
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      
      // Combine phone country code with phone number
      const fullPhone = formData.phone.trim() 
        ? `${phoneCountryCode}${formData.phone.trim()}` 
        : undefined;

      const addresses: any[] = [
        {
          label: 'home',
          type: 'shipping',
          isDefault: true,
          fullName: fullName,
          phone: fullPhone,
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2.trim() || undefined,
                ward: formData.ward.trim() || undefined,
                district: formData.district.trim() || undefined,
                city: formData.city.trim(),
                provinceCode: formData.provinceCode.trim() || undefined,
                country: COUNTRY_CODE_MAP[formData.country] || formData.country,
        }
      ];

      // Add billing address if useAsBilling is true
      if (useAsBilling) {
        addresses.push({
          label: 'billing',
          type: 'billing',
          isDefault: true,
          fullName: fullName,
          phone: fullPhone,
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2.trim() || undefined,
                ward: formData.ward.trim() || undefined,
                district: formData.district.trim() || undefined,
                city: formData.city.trim(),
                provinceCode: formData.provinceCode.trim() || undefined,
                country: COUNTRY_CODE_MAP[formData.country] || formData.country,
        });
      }

      // Prepare payment methods
      const preparedPaymentMethods = paymentMethods.map(pm => {
        const method: any = {
          type: pm.type,
          isDefault: pm.isDefault,
        };
        
        if (pm.type === 'bank') {
          if (pm.provider) method.provider = pm.provider.trim();
          if (pm.accountNumber) method.accountNumber = pm.accountNumber.trim();
          if (pm.accountName) method.accountName = pm.accountName.trim();
          if (pm.last4) method.last4 = pm.last4.trim();
        } else if (pm.type === 'card') {
          if (pm.brand) method.brand = pm.brand.trim();
          if (pm.last4) method.last4 = pm.last4.trim();
          if (pm.accountName) method.accountName = pm.accountName.trim();
        }
        // For cash type, no additional fields needed
        
        return method;
      });

      const customerData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        fullName: fullName,
        email: formData.email.trim().toLowerCase(),
        phone: fullPhone,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth ? (() => {
          const isoDate = convertDateToISO(formData.dateOfBirth);
          return isoDate ? new Date(isoDate).toISOString() : undefined;
        })() : undefined,
        avatarUrl: avatarPreview?.url || undefined,
        status: formData.status || undefined,
        addresses: addresses,
        paymentMethods: preparedPaymentMethods,
      };

      const response = await createCustomer(customerData);
      
      if (response?.success || response?.data) {
        alert('Customer added successfully!');
        if (setActivePage) {
          setActivePage('Customers');
        } else if (onBack) {
          onBack();
        }
      } else {
        throw new Error(response?.message || 'Failed to create customer');
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Failed to create customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard this customer? All unsaved changes will be lost.')) {
      if (setActivePage) {
        setActivePage('Customers');
      } else if (onBack) {
        onBack();
      }
    }
  };

  return (
    <div className="bg-background-light p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Add Customer</h2>
        <button
          onClick={handleDiscard}
          className="p-2 rounded-lg hover:bg-background-dark text-text-secondary hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-background-dark/40 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Phone
              </label>
              <div className="flex gap-2">
                <div className="relative" ref={phoneCodeDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setPhoneCodeMenuOpen((prev) => !prev)}
                    className="bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary flex items-center gap-1 hover:bg-background-dark hover:transform-none hover:shadow-none min-w-[90px]"
                  >
                    <span className="text-text-primary">{phoneCountryCode}</span>
                    <ChevronDown size={16} className="text-text-secondary" />
                  </button>
                  {phoneCodeMenuOpen && (
                    <div className="absolute z-30 mt-2 w-48 bg-background-dark border border-gray-600 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                      {PHONE_COUNTRY_CODES.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setPhoneCountryCode(item.code);
                            setPhoneCodeMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-text-primary hover:bg-background-dark/60 flex items-center gap-2"
                        >
                          <span>{item.flag}</span>
                          <span className="flex-1">{item.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="tel"
                  placeholder="1234567890"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="flex-1 bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className={`w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  formData.gender === '' ? 'text-text-secondary' : 'text-text-primary'
                }`}
              >
                <option value="" disabled>Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <JoinDatePicker
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(value) => handleInputChange('dateOfBirth', value)}
                placeholder="mm/dd/yyyy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className={`w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                  formData.status === '' ? 'text-text-secondary' : 'text-text-primary'
                }`}
              >
                <option value="" disabled>Select status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>

          </div>
        </div>

        {/* Avatar Upload */}
        <div className="bg-background-dark/40 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Avatar</h3>
          <div
            className={`group border-2 border-dashed rounded-lg p-6 sm:p-10 transition-all duration-300 cursor-pointer ${
              isDragActive 
                ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20' 
                : 'border-gray-600 hover:border-primary hover:bg-primary/5 hover:shadow-md'
            } ${avatarPreview ? 'text-left' : 'text-center'}`}
            onClick={handleAvatarTrigger}
            onDrop={handleAvatarDrop}
            onDragOver={handleAvatarDragOver}
            onDragLeave={handleAvatarDragLeave}
          >
            {avatarPreview ? (
              <div className="max-w-xs bg-background-dark/50 border border-gray-700 rounded-lg overflow-hidden">
                <div className="aspect-square bg-background-dark">
                  <img
                    src={avatarPreview.url}
                    alt={avatarPreview.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-sm font-semibold text-text-primary truncate">{avatarPreview.file.name}</p>
                  <p className="text-xs text-text-secondary">{formatFileSize(avatarPreview.file.size)}</p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveAvatar();
                    }}
                    className="flex items-center gap-2 text-xs font-medium text-red-400 hover:underline"
                  >
                    <Trash2 size={14} />
                    Remove file
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-sm font-medium text-text-primary">
                    <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-text-secondary">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={avatarInputRef}
              accept="image/*"
              onChange={(e) => handleAvatarFiles(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-background-dark/40 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Shipping Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Address Line 1 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Ward
                </label>
                <input
                  type="text"
                  value={formData.ward}
                  onChange={(e) => handleInputChange('ward', e.target.value)}
                  className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Town / City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  State / Province
                </label>
                <input
                  type="text"
                  value={formData.provinceCode}
                  onChange={(e) => handleInputChange('provinceCode', e.target.value)}
                  className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                />
              </div>
            </div>

            <div>
              <CountrySelect
                value={formData.country}
                onChange={(value) => handleInputChange('country', value)}
                label="Country"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-background-dark/40 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Payment Methods</h3>
            <button
              type="button"
              onClick={handleAddPaymentMethod}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Payment Method
            </button>
          </div>

          {paymentMethods.length === 0 ? (
            <p className="text-sm text-text-secondary">No payment methods added. Click "Add Payment Method" to add one.</p>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((pm, index) => (
                <div key={index} className="bg-background-dark border border-gray-600 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-text-primary">Payment Method {index + 1}</h4>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm text-text-secondary">
                        <input
                          type="checkbox"
                          checked={pm.isDefault}
                          onChange={(e) => handlePaymentMethodChange(index, 'isDefault', e.target.checked)}
                          className="rounded"
                        />
                        Default
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemovePaymentMethod(index)}
                        className="p-1 text-red-400 hover:text-red-300"
                        aria-label="Remove payment method"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={pm.type}
                        onChange={(e) => handlePaymentMethodChange(index, 'type', e.target.value)}
                        className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank">Bank</option>
                      </select>
                    </div>

                    {pm.type === 'bank' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            Provider
                          </label>
                          <input
                            type="text"
                            placeholder="Vietcombank"
                            value={pm.provider || ''}
                            onChange={(e) => handlePaymentMethodChange(index, 'provider', e.target.value)}
                            className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            Account Number
                          </label>
                          <input
                            type="text"
                            placeholder="1234567890"
                            value={pm.accountNumber || ''}
                            onChange={(e) => handlePaymentMethodChange(index, 'accountNumber', e.target.value)}
                            className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            Account Name
                          </label>
                          <input
                            type="text"
                            placeholder="Account holder name"
                            value={pm.accountName || ''}
                            onChange={(e) => handlePaymentMethodChange(index, 'accountName', e.target.value)}
                            className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            Last 4 Digits
                          </label>
                          <input
                            type="text"
                            placeholder="7890"
                            maxLength={4}
                            value={pm.last4 || ''}
                            onChange={(e) => handlePaymentMethodChange(index, 'last4', e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                          />
                        </div>
                      </>
                    )}

                    {pm.type === 'card' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            Brand
                          </label>
                          <input
                            type="text"
                            placeholder="VISA, Mastercard, etc."
                            value={pm.brand || ''}
                            onChange={(e) => handlePaymentMethodChange(index, 'brand', e.target.value)}
                            className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            placeholder="1234567890123456"
                            value={pm.accountNumber || ''}
                            onChange={(e) => handlePaymentMethodChange(index, 'accountNumber', e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            placeholder="Cardholder name"
                            value={pm.accountName || ''}
                            onChange={(e) => handlePaymentMethodChange(index, 'accountName', e.target.value)}
                            className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            Last 4 Digits
                          </label>
                          <input
                            type="text"
                            placeholder="3456"
                            maxLength={4}
                            value={pm.last4 || ''}
                            onChange={(e) => handlePaymentMethodChange(index, 'last4', e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Billing Address Option */}
        <div className="bg-background-dark/40 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Use as a billing address?
              </label>
              <p className="text-xs text-text-secondary mt-1">
                If you need more info, please check budget.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUseAsBilling(!useAsBilling)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors hover:transform-none hover:shadow-none ${
                useAsBilling ? 'bg-primary' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useAsBilling ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;

