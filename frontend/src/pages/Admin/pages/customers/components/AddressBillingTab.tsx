import React, { useState } from 'react';
import { Edit, Trash2, MoreVertical, Plus, ChevronRight } from 'lucide-react';
import Badge from '../../../components/Badge';

type Address = {
  id: string;
  label: string;
  address: string;
  isDefault?: boolean;
};

type PaymentMethod = {
  id: string;
  brand: string;
  expires?: string;
  isPrimary?: boolean;
  address?: string;
};

const AddressBillingTab: React.FC<{ customer: any }> = ({ customer }) => {
  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', label: 'Home', address: '23 Shatinon Mekalan', isDefault: true },
    { id: '2', label: 'Office', address: '45 Roker Terrace' },
    { id: '3', label: 'Family', address: '512 Water Plant' },
  ]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', brand: 'Mastercard', expires: 'Apr 2028' },
    { id: '2', brand: 'American Express', expires: 'Apr 2028', isPrimary: true, address: '45 Roker Terrace' },
    { id: '3', brand: 'Visa', address: '512 Water Plant' },
  ]);

  const handleAddAddress = () => {
    // TODO: Implement add address functionality
    console.log('Add new address');
  };

  const handleAddPaymentMethod = () => {
    // TODO: Implement add payment method functionality
    console.log('Add payment methods');
  };

  const handleEditAddress = (id: string) => {
    // TODO: Implement edit address functionality
    console.log('Edit address:', id);
  };

  const handleDeleteAddress = (id: string) => {
    // TODO: Implement delete address functionality
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const handleEditPayment = (id: string) => {
    // TODO: Implement edit payment method functionality
    console.log('Edit payment method:', id);
  };

  const handleDeletePayment = (id: string) => {
    // TODO: Implement delete payment method functionality
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
  };

  const getCardLogo = (brand: string) => {
    // Simple text representation, in production you'd use actual logos
    return brand.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Address Book Section */}
      <div className="bg-background-light p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-text-primary">Address Book</h4>
          <button
            onClick={handleAddAddress}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add new address
          </button>
        </div>

        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-center justify-between p-4 bg-background-dark rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <ChevronRight size={16} className="text-text-secondary" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-text-primary">{address.label}</span>
                    {address.isDefault && (
                      <Badge color="green">Default Address</Badge>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">{address.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditAddress(address.id)}
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Edit address"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="p-2 text-text-secondary hover:text-accent-red transition-colors"
                  aria-label="Delete address"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="More options"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="bg-background-light p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-text-primary">Payment Methods</h4>
          <button
            onClick={handleAddPaymentMethod}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add payment methods
          </button>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 bg-background-dark rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <ChevronRight size={16} className="text-text-secondary" />
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">{getCardLogo(payment.brand)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-text-primary">{payment.brand}</span>
                    {payment.isPrimary && (
                      <Badge color="green">Primary</Badge>
                    )}
                  </div>
                  {payment.expires && (
                    <p className="text-sm text-text-secondary">Expires {payment.expires}</p>
                  )}
                  {payment.address && (
                    <p className="text-sm text-text-secondary">{payment.address}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditPayment(payment.id)}
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Edit payment method"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeletePayment(payment.id)}
                  className="p-2 text-text-secondary hover:text-accent-red transition-colors"
                  aria-label="Delete payment method"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="More options"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddressBillingTab;

