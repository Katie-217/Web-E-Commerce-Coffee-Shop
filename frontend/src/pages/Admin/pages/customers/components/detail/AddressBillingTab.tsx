import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Plus, ChevronRight } from 'lucide-react';
import Badge from '../../../../components/Badge';
import AddNewAddressModal from './AddNewAddressModal';
import { updateCustomer, fetchCustomerById } from '../../../../../../api/customers';

const AddressBillingTab: React.FC<{ customer: any; onCustomerUpdate?: (updatedCustomer: any) => void }> = ({ customer, onCustomerUpdate }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<{ address: any; id: string } | null>(null);
  // Format address for display
  const formatAddress = (addr: any): string => {
    if (!addr) return '';
    const parts: string[] = [];
    
    if (addr.addressLine1) parts.push(addr.addressLine1);
    if (addr.addressLine2) parts.push(addr.addressLine2);
    if (addr.ward) parts.push(addr.ward);
    if (addr.district) parts.push(addr.district);
    if (addr.city) parts.push(addr.city);
    if (addr.postalCode) parts.push(addr.postalCode);
    if (addr.country) parts.push(addr.country);
    
    return parts.filter(Boolean).join(', ');
  };

  // Get addresses from customer data
  const addresses = useMemo(() => {
    if (!customer?.addresses || !Array.isArray(customer.addresses)) {
      return [];
    }
    return customer.addresses.map((addr: any, index: number) => {
      // IMPORTANT: Addresses in MongoDB schema have { _id: false }, so they don't have _id
      // We need to use the index in the array to identify them
      // However, if _id exists (from some data sources), use it
      let actualId: string | null = null;
      
      if (addr._id) {
        // Handle different _id formats (in case some addresses have _id)
        if (typeof addr._id === 'string') {
          actualId = addr._id;
        } else if (addr._id.$oid) {
          // MongoDB extended JSON format: { $oid: "..." }
          actualId = addr._id.$oid;
        } else if (addr._id.toString) {
          // ObjectId object
          actualId = addr._id.toString();
        } else {
          actualId = String(addr._id);
        }
      } else {
        // No _id - use index as identifier
        // Store index for later reference
        actualId = `index-${index}`;
      }
      
      return {
        ...addr,
        // Use actual _id if available, otherwise use index-based id
        id: actualId,
        // Store index for reference
        _index: index,
        // Preserve original _id for reference (may be undefined)
        _id: addr._id,
        formattedAddress: formatAddress(addr),
      };
    });
  }, [customer?.addresses]);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingAddress(null);
  };

  const handleSubmitAddress = async (addressData: any, addressId?: string) => {
    // Validate customer exists and has ID
    if (!customer) {
      throw new Error('Customer information is required');
    }
    if (!customer._id && !customer.id) {
      throw new Error('Customer ID is required');
    }

    // Get customer ID - this will be used to UPDATE existing document, not create new one
    // Ensure customerId is a string (backend will convert to ObjectId if needed)
    const customerId = String(customer._id || customer.id);
    
    console.log('🔍 Customer ID for update:', customerId, 'Type:', typeof customerId);
    console.log('🔍 Customer object:', { _id: customer._id, id: customer.id });
    
    // Get existing addresses from current customer document
    const currentAddresses = Array.isArray(customer.addresses) ? [...customer.addresses] : [];
    
    console.log('🔍 Current addresses count:', currentAddresses.length);
    console.log('🔍 Current addresses:', JSON.stringify(currentAddresses, null, 2));
    
    // Get country from customer or primary address
    const primaryAddress = customer.addresses?.find((a: any) => a.isDefault) || customer.addresses?.[0];
    const country = customer.country || primaryAddress?.country || '';
    
    // Create address object (without fullName, firstName, lastName)
    const addressObj: any = {
      ...addressData,
      country: country || addressData.country || 'VN', // Default to VN if not set
    };
    
    // Remove useAsBilling from address object (it's not part of schema)
    delete addressObj.useAsBilling;
    
    // Set type based on useAsBilling flag
    if (addressData.useAsBilling) {
      addressObj.type = 'billing';
    } else {
      addressObj.type = 'shipping'; // Default to shipping
    }
    
    let updatedAddresses: any[];
    
    if (addressId) {
      // Edit mode: Update existing address
      // If useAsBilling is true, set as default and remove default from others
      if (addressData.useAsBilling) {
        addressObj.isDefault = true;
      }
      
      // IMPORTANT: Addresses don't have _id (schema has { _id: false })
      // We need to use the index in the addresses array to identify them
      // addressId can be: "index-0", "_id string" (if exists), or other format
      const normalizedAddressId = addressId.toString();
      console.log('🔍 Looking for address with ID:', normalizedAddressId);
      console.log('🔍 Available addresses:', currentAddresses.map((a: any, idx: number) => ({
        index: idx,
        indexId: `index-${idx}`,
        _id: a._id?.toString() || (a._id ? String(a._id) : 'NO_ID'),
        city: a.city
      })));
      
      let addressFound = false;
      let targetIndex: number | null = null;
      
      // Check if addressId is in format "index-{number}"
      if (normalizedAddressId.startsWith('index-')) {
        const indexMatch = normalizedAddressId.match(/^index-(\d+)$/);
        if (indexMatch) {
          targetIndex = parseInt(indexMatch[1], 10);
          console.log('📍 Using index-based lookup. Target index:', targetIndex);
        }
      }
      
      updatedAddresses = currentAddresses.map((addr: any, index: number) => {
        // Check if this is the address we want to update
        let isMatch = false;
        
        if (targetIndex !== null) {
          // Use index-based matching (primary method since addresses don't have _id)
          isMatch = index === targetIndex;
        } else {
          // Try to match by _id or other identifier (fallback)
          const addrId = (addr._id?.toString && addr._id.toString()) || 
                        (addr._id ? String(addr._id) : null) ||
                        (addr.id?.toString && addr.id.toString()) || 
                        (addr.id ? String(addr.id) : null);
          isMatch = addrId && addrId === normalizedAddressId;
        }
        
        if (isMatch) {
          console.log('✅ Found address to update at index', index, 'with data:', addressObj);
          addressFound = true;
          // Update the address - don't preserve _id since addresses don't have _id in schema
          return {
            ...addressObj,
            // Don't add _id since schema has { _id: false }
            isDefault: addressData.useAsBilling ? true : (addressObj.isDefault !== undefined ? addressObj.isDefault : addr.isDefault),
          };
        }
        // Remove default flag from other addresses if useAsBilling is true
        if (addressData.useAsBilling) {
          return { ...addr, isDefault: false };
        }
        return addr;
      });
      
      // Verify that we actually found and updated an address
      if (!addressFound) {
        console.error('❌ Address not found for update. addressId:', normalizedAddressId);
        console.error('❌ Available addresses:', currentAddresses.map((a: any, idx: number) => ({
          index: idx,
          indexId: `index-${idx}`,
          _id: a._id?.toString() || (a._id ? String(a._id) : 'NO_ID'),
          city: a.city
        })));
        throw new Error(`Address with ID ${normalizedAddressId} not found. Please refresh the page and try again.`);
      }
    } else {
      // Add mode: Add new address
      // If this is the first address or useAsBilling is true, set as default
      if (currentAddresses.length === 0 || addressData.useAsBilling) {
        addressObj.isDefault = true;
        // Remove default flag from other addresses
        currentAddresses.forEach(addr => {
          addr.isDefault = false;
        });
      } else {
        addressObj.isDefault = false;
      }
      
      updatedAddresses = [...currentAddresses, addressObj];
    }

    // IMPORTANT: This will UPDATE the existing customer document in MongoDB
    // It will NOT create a new document - backend uses findOneAndUpdate without upsert
    console.log('📤 Sending update to backend.');
    console.log('📤 Customer ID:', customerId);
    console.log('📤 Updated addresses count:', updatedAddresses.length);
    console.log('📤 Updated addresses:', JSON.stringify(updatedAddresses, null, 2));
    
    const updatePayload = {
      addresses: updatedAddresses,
    };
    
    console.log('📤 Update payload:', JSON.stringify(updatePayload, null, 2));
    
    try {
      console.log('📤 Making API call to update customer...');
      const response = await updateCustomer(customerId, updatePayload);

      console.log('📥 Raw response from API:', response);
      console.log('📥 Response type:', typeof response);
      console.log('📥 Response.success:', response?.success);
      console.log('📥 Response.data:', response?.data);
      console.log('📥 Response.message:', response?.message);

      // API client uses fetch API, returns data directly (not response.data)
      // Response structure: { success: true, data: {...}, message: '...' }
      const isSuccess = response?.success === true;
      
      if (!isSuccess) {
        console.error('❌ Update failed. Response:', JSON.stringify(response, null, 2));
        const errorMessage = response?.message || response?.error || 'Failed to update customer addresses';
        throw new Error(errorMessage);
      }
      
      // Use the updated customer data from backend response (most reliable)
      // Response structure: { success: true, data: {...}, message: '...' }
      const updatedCustomerFromServer = response?.data || response;
      
      console.log('✅ Update successful. Updated customer from server:', JSON.stringify(updatedCustomerFromServer, null, 2));
      console.log('✅ Updated addresses in response:', JSON.stringify(updatedCustomerFromServer?.addresses, null, 2));
      
      // CRITICAL: Always refresh from server to ensure we have the latest data from MongoDB
      try {
        console.log('🔄 Refreshing customer data from server to verify update...');
        const refreshResponse = await fetchCustomerById(customerId);
        console.log('🔄 Refresh response:', refreshResponse);
        
        if (refreshResponse && refreshResponse.success !== false) {
          const refreshedCustomer = refreshResponse?.data || refreshResponse;
          if (refreshedCustomer) {
            console.log('✅ Refreshed customer data from server:', JSON.stringify(refreshedCustomer, null, 2));
            console.log('✅ Refreshed addresses:', JSON.stringify(refreshedCustomer.addresses, null, 2));
            
            // Verify that addresses were actually updated in MongoDB
            if (refreshedCustomer.addresses && refreshedCustomer.addresses.length > 0) {
              const addressMatch = refreshedCustomer.addresses.some((addr: any) => 
                addr.addressLine1 === addressObj.addressLine1
              );
              if (addressMatch) {
                console.log('✅ Verified: Address was successfully updated in MongoDB');
              } else {
                console.warn('⚠️ Warning: Address may not have been updated in MongoDB');
              }
            }
            
            // Call callback with refreshed data
            if (onCustomerUpdate) {
              console.log('🔄 Calling onCustomerUpdate with refreshed data');
              onCustomerUpdate(refreshedCustomer);
            } else {
              console.warn('⚠️ onCustomerUpdate callback not provided');
            }
          } else {
            console.warn('⚠️ Refresh response did not contain customer data');
            // Fallback to using response data
            if (onCustomerUpdate) {
              onCustomerUpdate(updatedCustomerFromServer);
            }
          }
        } else {
          console.warn('⚠️ Refresh failed or returned error');
          // Fallback to using response data
          if (onCustomerUpdate) {
            onCustomerUpdate(updatedCustomerFromServer);
          }
        }
      } catch (refreshError: any) {
        console.error('❌ Failed to refresh customer data:', refreshError);
        console.error('❌ Refresh error message:', refreshError?.message);
        // Even if refresh fails, update UI with response data
        if (onCustomerUpdate) {
          onCustomerUpdate(updatedCustomerFromServer);
        }
      }
    } catch (error: any) {
      console.error('❌ Error updating customer addresses:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error stack:', error?.stack);
      throw error;
    }
  };

  const handleEditAddress = (id: string) => {
    const address = addresses.find((addr) => addr.id === id);
    if (address) {
      console.log('Edit address clicked. id param:', id, 'address:', address);
      
      // CRITICAL: Addresses don't have _id (schema has { _id: false })
      // We need to use the index in the addresses array to identify the address
      // The id can be:
      // 1. index-{index} - if no _id exists
      // 2. _id string - if _id exists (from some data sources)
      
      // Use the stored index or find the index in the original addresses array
      let actualId: string;
      
      if (address._index !== undefined) {
        // Use stored index
        actualId = `index-${address._index}`;
      } else if (address._id) {
        // Has _id, use it
        actualId = address._id.toString ? address._id.toString() : String(address._id);
      } else {
        // Find index in original array
        const index = customer?.addresses?.findIndex((a: any) => {
          // Compare by all fields to find the matching address
          return a.city === address.city &&
                 a.district === address.district &&
                 a.ward === address.ward &&
                 a.addressLine1 === address.addressLine1;
        });
        
        if (index !== undefined && index >= 0) {
          actualId = `index-${index}`;
        } else {
          // Fallback to the id we have
          actualId = address.id || id;
        }
      }
      
      console.log('Using address ID for update:', actualId, 'address._index:', address._index, 'address._id:', address._id, 'address.id:', address.id);
      
      // Set editing address and open modal - pass the original address object and the identifier
      setEditingAddress({ address, id: actualId });
      setIsAddModalOpen(true);
    } else {
      console.error('❌ Address not found for id:', id);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    // Validate customer exists and has ID
    if (!customer) {
      alert('Customer information is required');
      return;
    }
    if (!customer._id && !customer.id) {
      alert('Customer ID is required');
      return;
    }

    try {
      const customerId = String(customer._id || customer.id);
      const currentAddresses = Array.isArray(customer.addresses) ? [...customer.addresses] : [];
      
      console.log('🗑️ Deleting address with ID:', id);
      console.log('🗑️ Current addresses count:', currentAddresses.length);
      
      // Find the address to delete using the same logic as edit
      // Addresses don't have _id (schema has { _id: false }), so we use index
      const normalizedAddressId = id.toString();
      let targetIndex: number | null = null;
      
      // Check if addressId is in format "index-{number}"
      if (normalizedAddressId.startsWith('index-')) {
        const indexMatch = normalizedAddressId.match(/^index-(\d+)$/);
        if (indexMatch) {
          targetIndex = parseInt(indexMatch[1], 10);
          console.log('📍 Using index-based deletion. Target index:', targetIndex);
        }
      } else {
        // Try to find by _id if it exists (fallback)
        const foundIndex = currentAddresses.findIndex((addr: any, index: number) => {
          const addrId = (addr._id?.toString && addr._id.toString()) || 
                        (addr._id ? String(addr._id) : null) ||
                        (addr.id?.toString && addr.id.toString()) || 
                        (addr.id ? String(addr.id) : null);
          return addrId && addrId === normalizedAddressId;
        });
        
        if (foundIndex >= 0) {
          targetIndex = foundIndex;
          console.log('📍 Found address by _id at index:', targetIndex);
        }
      }
      
      if (targetIndex === null || targetIndex < 0 || targetIndex >= currentAddresses.length) {
        console.error('❌ Address not found for deletion. ID:', normalizedAddressId);
        alert('Address not found. Please refresh the page and try again.');
        return;
      }
      
      // Get the address to be deleted (for checking if it's default)
      const deletedAddress = currentAddresses[targetIndex];
      const wasDefault = deletedAddress?.isDefault || false;
      
      console.log('🗑️ Deleting address at index:', targetIndex);
      console.log('🗑️ Address to delete:', JSON.stringify(deletedAddress, null, 2));
      console.log('🗑️ Was default:', wasDefault);
      
      // Filter out the address to delete using index
      const updatedAddresses = currentAddresses.filter((addr: any, index: number) => {
        return index !== targetIndex;
      });

      // If we deleted the default address and there are other addresses, set the first one as default
      if (wasDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
        console.log('✅ Set first remaining address as default');
      }

      console.log('🗑️ Updated addresses count:', updatedAddresses.length);
      console.log('🗑️ Updated addresses:', JSON.stringify(updatedAddresses, null, 2));

      // Update customer in MongoDB
      const updatePayload = {
        addresses: updatedAddresses,
      };
      
      console.log('📤 Sending delete request to backend...');
      const response = await updateCustomer(customerId, updatePayload);

      console.log('📥 Delete response:', response);
      
      // API client returns data directly
      const isSuccess = response?.success === true;
      
      if (!isSuccess) {
        console.error('❌ Delete failed. Response:', JSON.stringify(response, null, 2));
        throw new Error(response?.message || response?.error || 'Failed to delete address');
      }

      // CRITICAL: Always refresh from server to ensure we have the latest data from MongoDB
      console.log('🔄 Refreshing customer data from server after deletion...');
      try {
        const refreshResponse = await fetchCustomerById(customerId);
        console.log('🔄 Refresh response:', refreshResponse);
        
        if (refreshResponse && refreshResponse.success !== false) {
          const refreshedCustomer = refreshResponse?.data || refreshResponse;
          if (refreshedCustomer) {
            console.log('✅ Refreshed customer data from server after deletion');
            console.log('✅ Refreshed addresses:', JSON.stringify(refreshedCustomer.addresses, null, 2));
            
            // Call callback with refreshed data
            if (onCustomerUpdate) {
              console.log('🔄 Calling onCustomerUpdate with refreshed data');
              onCustomerUpdate(refreshedCustomer);
            }
          } else {
            console.warn('⚠️ Refresh response did not contain customer data');
            // Fallback to using local updated data
            const updatedCustomer = {
              ...customer,
              addresses: updatedAddresses,
            };
            if (onCustomerUpdate) {
              onCustomerUpdate(updatedCustomer);
            }
          }
        } else {
          console.warn('⚠️ Refresh failed or returned error');
          // Fallback to using local updated data
          const updatedCustomer = {
            ...customer,
            addresses: updatedAddresses,
          };
          if (onCustomerUpdate) {
            onCustomerUpdate(updatedCustomer);
          }
        }
      } catch (refreshError: any) {
        console.error('❌ Failed to refresh customer data after deletion:', refreshError);
        // Even if refresh fails, update UI with local data
        const updatedCustomer = {
          ...customer,
          addresses: updatedAddresses,
        };
        if (onCustomerUpdate) {
          onCustomerUpdate(updatedCustomer);
        }
      }
    } catch (err: any) {
      console.error('❌ Error deleting address:', err);
      alert(err?.message || 'Failed to delete address');
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

      {/* Add/Edit Address Modal */}
      <AddNewAddressModal
        key={editingAddress?.id || 'add-mode'} // Force re-render when switching between add/edit
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitAddress}
        customer={customer}
        initialData={editingAddress?.address}
        addressId={editingAddress?.id}
      />
    </div>
  );
};

export default AddressBillingTab;

