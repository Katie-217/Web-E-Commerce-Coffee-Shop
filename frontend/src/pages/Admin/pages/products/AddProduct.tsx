import React from 'react';
import { UploadCloud, Plus, X } from 'lucide-react';

const FormInput: React.FC<{ label: string; placeholder: string; type?: string; id: string; className?: string }> = ({ label, placeholder, type = 'text', id, className }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <input type={type} id={id} placeholder={placeholder} className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary" />
    </div>
);

const FormSelect: React.FC<{ label: string; id: string; children: React.ReactNode }> = ({ label, id, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <select id={id} className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary appearance-none">
            {children}
        </select>
    </div>
);

const AddProduct: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text-primary">Add a new Product</h2>
                <div className="flex gap-2">
                    <button className="bg-background-light text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">Discard</button>
                    <button className="bg-background-light text-text-primary font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">Save Draft</button>
                    <button className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Publish Product</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-background-light p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-text-primary">Product Information</h3>
                        <div className="space-y-4">
                            <FormInput label="Name" placeholder="Product title" id="product-name" />
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="SKU" placeholder="SKU" id="sku" />
                                <FormInput label="Barcode" placeholder="0123-4567" id="barcode" />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Description (Optional)</label>
                                <textarea id="description" rows={6} placeholder="Product Description" className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="bg-background-light p-6 rounded-lg">
                         <h3 className="text-lg font-semibold mb-4 text-text-primary">Product Image</h3>
                         <div className="border-2 border-dashed border-gray-600 rounded-lg p-10 text-center cursor-pointer hover:border-primary">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                            <p className="mt-2 text-text-secondary">
                                <span className="font-semibold text-primary">Drag and drop your image here</span>
                            </p>
                            <p className="text-xs text-gray-500">or</p>
                            <button type="button" className="text-sm font-semibold text-primary hover:underline mt-1">Browse image</button>
                         </div>
                    </div>

                    <div className="bg-background-light p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-text-primary">Variants</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect label="Options" id="options">
                                    <option>Size</option>
                                    <option>Color</option>
                                    <option>Material</option>
                                </FormSelect>
                                <FormInput label="" placeholder="Enter size" id="size-value" className="self-end"/>
                            </div>
                            <button className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
                                <Plus size={16}/> Add another option
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className="space-y-6">
                    <div className="bg-background-light p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-text-primary">Pricing</h3>
                        <div className="space-y-4">
                            <FormInput label="Base Price" placeholder="Price" id="base-price" />
                            <FormInput label="Discounted Price" placeholder="Discounted Price" id="discounted-price" />
                            <div className="flex items-center justify-between">
                                <label htmlFor="charge-tax" className="text-sm font-medium text-text-primary">Charge tax on this product</label>
                                <label htmlFor="charge-tax" className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" value="" id="charge-tax" className="sr-only peer" defaultChecked/>
                                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="bg-background-light p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-text-primary">Organize</h3>
                        <div className="space-y-4">
                            <FormSelect label="Category" id="category">
                                <option>Select Category</option>
                                <option>Coffee Beans</option>
                                <option>Equipment</option>
                            </FormSelect>
                             <FormSelect label="Status" id="status">
                                <option>Published</option>
                                <option>Draft</option>
                                <option>Inactive</option>
                            </FormSelect>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Tags</label>
                                <div className="flex flex-wrap gap-2 p-2 border border-gray-600 rounded-lg bg-background-dark">
                                    <span className="flex items-center gap-1 bg-primary/20 text-primary text-sm px-2 py-1 rounded">Normal <X size={14}/></span>
                                    <span className="flex items-center gap-1 bg-primary/20 text-primary text-sm px-2 py-1 rounded">Standard <X size={14}/></span>
                                    <span className="flex items-center gap-1 bg-primary/20 text-primary text-sm px-2 py-1 rounded">Premium <X size={14}/></span>
                                    <input placeholder="" className="bg-transparent focus:outline-none flex-1" />
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
