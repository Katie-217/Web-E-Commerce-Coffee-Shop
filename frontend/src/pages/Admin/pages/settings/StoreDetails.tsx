import React from 'react';

const StoreDetails: React.FC = () => {
  return (
    <div className="bg-background-light p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Store Details</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Store Name</label>
          <input
            type="text"
            className="w-full bg-background-dark border border-gray-600 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter store name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Store Description</label>
          <textarea
            className="w-full bg-background-dark border border-gray-600 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
            placeholder="Enter store description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Store Email</label>
          <input
            type="email"
            className="w-full bg-background-dark border border-gray-600 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="store@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Store Phone</label>
          <input
            type="tel"
            className="w-full bg-background-dark border border-gray-600 rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button className="px-6 py-2 border border-gray-600 rounded-lg text-text-secondary hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreDetails;

























