// This file is no longer used as Settings is now a dropdown menu in the Sidebar
// Individual settings pages are rendered directly in App.tsx
// This file is kept for backward compatibility but can be removed if not needed
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="bg-background-light p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Settings</h2>
      <p className="text-text-secondary">Please select a settings option from the sidebar menu.</p>
    </div>
  );
};

export default Settings;

