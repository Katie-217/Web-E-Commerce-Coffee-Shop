import React, { useState } from 'react';

type NotificationType = {
  type: string;
  email: boolean;
  browser: boolean;
  app: boolean;
};

const NotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([
    { type: 'New for you', email: true, browser: true, app: true },
    { type: 'Account activity', email: true, browser: true, app: true },
    { type: 'A new browser used to sign in', email: true, browser: true, app: false },
    { type: 'A new device is linked', email: true, browser: false, app: false },
  ]);

  const handleToggle = (index: number, field: 'email' | 'browser' | 'app') => {
    setNotifications(prev =>
      prev.map((notif, i) =>
        i === index ? { ...notif, [field]: !notif[field] } : notif
      )
    );
  };

  const handleSave = () => {
    // TODO: Implement save functionality
  };

  const handleDiscard = () => {
    // TODO: Reset to original values
  };

  return (
    <div className="bg-background-light p-6 rounded-lg">
      <h4 className="text-lg font-semibold text-text-primary mb-2">Notifications</h4>
      <p className="text-sm text-text-secondary mb-6">You will receive notification for the below selected items.</p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700 text-sm text-text-secondary">
              <th className="p-3 text-left">TYPE</th>
              <th className="p-3 text-center">EMAIL</th>
              <th className="p-3 text-center">BROWSER</th>
              <th className="p-3 text-center">APP</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notif, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="p-3 text-text-primary font-medium">{notif.type}</td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={notif.email}
                    onChange={() => handleToggle(index, 'email')}
                    className="w-5 h-5 rounded border-gray-600 bg-background-dark text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={notif.browser}
                    onChange={() => handleToggle(index, 'browser')}
                    className="w-5 h-5 rounded border-gray-600 bg-background-dark text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={notif.app}
                    onChange={() => handleToggle(index, 'app')}
                    className="w-5 h-5 rounded border-gray-600 bg-background-dark text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSave}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Save changes
        </button>
        <button
          onClick={handleDiscard}
          className="bg-background-dark text-text-secondary px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Discard
        </button>
      </div>
    </div>
  );
};

export default NotificationsTab;

