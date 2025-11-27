import React from 'react';
import BackButton from '../../../../components/BackButton';

type AddProductHeaderProps = {
  onBack?: () => void;
  saving: boolean;
  onDiscard: () => void;
  onSubmit: (status: 'Publish' | 'Draft' | 'Inactive') => void;
};

const AddProductHeader: React.FC<AddProductHeaderProps> = ({ onBack, saving, onDiscard, onSubmit }) => (
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
        onClick={onDiscard}
        className="bg-background-light text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        disabled={saving}
      >
        Discard
      </button>
      <button
        onClick={() => onSubmit('Draft')}
        className="bg-background-light text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save draft'}
      </button>
      <button
        onClick={() => onSubmit('Publish')}
        className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        disabled={saving}
      >
        {saving ? 'Publishing...' : 'Publish product'}
      </button>
    </div>
  </div>
);

export default AddProductHeader;

