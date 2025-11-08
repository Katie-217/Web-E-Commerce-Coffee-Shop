import React, { useState } from 'react';
import { Eye, EyeOff, X, Edit, UserPlus } from 'lucide-react';

const SecurityTab: React.FC = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAlert, setShowAlert] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('+1(968) 945-8832');

  return (
    <div className="space-y-6">
      {/* Change Password Section */}
      <div className="bg-background-light p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Change Password</h4>
        
        {showAlert && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-yellow-400 mb-1">Ensure that these requirements are met</p>
              <p className="text-xs text-yellow-300">Minimum 8 characters long, uppercase & symbol</p>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="text-yellow-400 hover:text-yellow-300"
              aria-label="Dismiss alert"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-text-secondary mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                aria-label="Toggle password visibility"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-text-secondary mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background-dark border border-gray-600 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                aria-label="Toggle password visibility"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          Change Password
        </button>
      </div>

      {/* Two-steps verification Section */}
      <div className="bg-background-light p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-text-primary mb-2">Two-steps verification</h4>
        <p className="text-sm text-text-secondary mb-4">Keep your account secure with authentication step.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">SMS</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 bg-background-dark border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
              />
              <button
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Edit phone number"
              >
                <Edit size={18} />
              </button>
              <button
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Add phone number"
              >
                <UserPlus size={18} />
              </button>
            </div>
          </div>

          <p className="text-sm text-text-secondary">
            Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to log in.{' '}
            <a href="#" className="text-primary hover:underline">Learn more</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;

