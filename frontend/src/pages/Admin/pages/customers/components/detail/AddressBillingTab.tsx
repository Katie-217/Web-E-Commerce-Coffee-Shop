import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Plus, ChevronRight } from 'lucide-react';
import Badge from '../../../../components/Badge';

const AddressBillingTab: React.FC<{ customer: any }> = ({ customer }) => {
  // Format address for display
  const formatAddress = (addr: any): string => {
    if (!addr) return '';
    const parts: string[] = [];
    
    if (addr.addressLine1) parts.push(addr.addressLine1);
    if (addr.addressLine2) parts.push(addr.addressLine2);
    if (addr.ward) parts.push(addr.ward);
    if (addr.district) parts.push(addr.district);
    if (addr.city) parts.push(addr.city);
    if (addr.provinceCode) parts.push(addr.provinceCode);
    if (addr.postalCode) parts.push(addr.postalCode);
    if (addr.country) parts.push(addr.country);
    
    return parts.filter(Boolean).join(', ');
  };

  // Get addresses from customer data
  const addresses = useMemo(() => {
    if (!customer?.addresses || !Array.isArray(customer.addresses)) {
      return [];
    }
    return customer.addresses.map((addr: any, index: number) => ({
      ...addr,
      id: addr._id || `addr-${index}`,
      formattedAddress: formatAddress(addr),
    }));
  }, [customer?.addresses]);

  const handleAddAddress = () => {
    // TODO: Implement add address functionality
  };

  const handleEditAddress = (id: string) => {
    // TODO: Implement edit address functionality
  };

  const handleDeleteAddress = (id: string) => {
    // TODO: Implement delete address functionality
    // This will need to call API to delete address from customer
    if (window.confirm('Are you sure you want to delete this address?')) {
      // TODO: Call API to delete address
    }
  };

  return (
    <div className="space-y-6">
      {/* Address Book Section */}
      <div className="bg-background-light p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-text-primary">Address Book</h4>
          <button
            onClick={handleAddAddress}
            className="bg-background-light border border-gray-600 text-text-primary font-medium px-3 py-1.5 rounded-lg hover:bg-background-dark hover:border-gray-500 transition-all duration-200 flex items-center gap-1.5 text-sm"
          >
            <Plus size={14} />
            Add new address
          </button>
        </div>

        <div className="space-y-3">
          {addresses.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <p>No addresses found</p>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className="flex items-center justify-between p-4 bg-background-dark rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <ChevronRight size={16} className="text-text-secondary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-text-primary capitalize">
                        {address.label || address.type || 'Address'}
                      </span>
                      {address.isDefault && (
                        <Badge color="green">Default Address</Badge>
                      )}
                      {address.type && (
                        <Badge color={address.type === 'billing' ? 'blue' : 'gray'}>
                          {address.type === 'billing' ? 'Billing' : 'Shipping'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary">{address.formattedAddress || 'No address details'}</p>
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
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default AddressBillingTab;

