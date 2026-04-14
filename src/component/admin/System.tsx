import { useState, useEffect } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

interface SystemSettings {
  general: {
    siteName: string;
    siteEmail: string;
    maintenanceMode: boolean;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
  booking: {
    minBookingDays: number;
    maxBookingDays: number;
    cancellationPolicy: string;
    autoConfirmBookings: boolean;
    requirePaymentConfirmation: boolean;
  };
  payment: {
    enabledGateways: string[];
    defaultGateway: string;
    autoRefundDays: number;
    paymentReminderDays: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    bookingAlerts: boolean;
    paymentAlerts: boolean;
    systemAlerts: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    twoFactorAuth: boolean;
    loginAttempts: number;
    ipWhitelist: string[];
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    retentionDays: number;
    lastBackup: string;
  };
}

const System = () => {
  const { isDarkMode } = useDarkMode();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'booking' | 'payment' | 'notifications' | 'security' | 'backup'>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoadingSave, setIsLoadingSave] = useState(false);

  useEffect(() => {
    // Mock system settings data
    const mockSettings: SystemSettings = {
      general: {
        siteName: 'Room Rental System',
        siteEmail: 'admin@roomrental.com',
        maintenanceMode: false,
        timezone: 'Asia/Kathmandu',
        dateFormat: 'YYYY-MM-DD',
        currency: 'NPR'
      },
      booking: {
        minBookingDays: 1,
        maxBookingDays: 365,
        cancellationPolicy: '24 hours before check-in',
        autoConfirmBookings: true,
        requirePaymentConfirmation: true
      },
      payment: {
        enabledGateways: ['esewa', 'khalti', 'bank-transfer'],
        defaultGateway: 'esewa',
        autoRefundDays: 7,
        paymentReminderDays: 3
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        bookingAlerts: true,
        paymentAlerts: true,
        systemAlerts: true
      },
      security: {
        sessionTimeout: 30,
        passwordMinLength: 8,
        twoFactorAuth: false,
        loginAttempts: 5,
        ipWhitelist: ['192.168.1.1', '10.0.0.1']
      },
      backup: {
        autoBackup: true,
        backupFrequency: 'daily',
        retentionDays: 30,
        lastBackup: '2024-03-24 02:00 AM'
      }
    };

    setTimeout(() => {
      setSettings(mockSettings);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSave = async () => {
    setIsLoadingSave(true);
    setSaveMessage('');

    // Simulate API call
    setTimeout(() => {
      setIsLoadingSave(false);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1500);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset logic here
      setSaveMessage('Settings reset to default values!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleBackup = () => {
    setSaveMessage('Backup initiated...');
    setTimeout(() => {
      setSaveMessage('Backup completed successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 2000);
  };

  const updateSetting = (category: keyof SystemSettings, field: string, value: any) => {
    if (!settings) return;

    setSettings(prev => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-gray-600 ${isDarkMode ? 'text-gray-400' : ''}`}>Loading system settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={`text-gray-600 ${isDarkMode ? 'text-gray-400' : ''}`}>No settings data available.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'booking', label: 'Booking', icon: '📅' },
    { id: 'payment', label: 'Payment', icon: '💰' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'backup', label: 'Backup', icon: '💾' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Settings</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleBackup}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Backup Now
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={isLoadingSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoadingSave ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className={`${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-100 border-green-400'} ${isDarkMode ? 'text-green-400' : 'text-green-700'} px-4 py-3 rounded-lg`}>
          {saveMessage}
        </div>
      )}

      {/* Tabs */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : `border-transparent ${isDarkMode ? 'text-gray-500 hover:text-gray-300 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm`}>
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>General Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Site Name</label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Site Email</label>
                <input
                  type="email"
                  value={settings.general.siteEmail}
                  onChange={(e) => updateSetting('general', 'siteEmail', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Timezone</label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="Asia/Kathmandu">Asia/Kathmandu</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Currency</label>
                <select
                  value={settings.general.currency}
                  onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="NPR">NPR (Nepalese Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.general.maintenanceMode}
                onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Enable Maintenance Mode
              </label>
            </div>
          </div>
        )}

        {/* Booking Settings */}
        {activeTab === 'booking' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Booking Days</label>
                <input
                  type="number"
                  value={settings.booking.minBookingDays}
                  onChange={(e) => updateSetting('booking', 'minBookingDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Booking Days</label>
                <input
                  type="number"
                  value={settings.booking.maxBookingDays}
                  onChange={(e) => updateSetting('booking', 'maxBookingDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Policy</label>
                <textarea
                  value={settings.booking.cancellationPolicy}
                  onChange={(e) => updateSetting('booking', 'cancellationPolicy', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.booking.autoConfirmBookings}
                  onChange={(e) => updateSetting('booking', 'autoConfirmBookings', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Auto-confirm Bookings
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.booking.requirePaymentConfirmation}
                  onChange={(e) => updateSetting('booking', 'requirePaymentConfirmation', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Require Payment Confirmation
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Gateway</label>
                <select
                  value={settings.payment.defaultGateway}
                  onChange={(e) => updateSetting('payment', 'defaultGateway', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="esewa">eSewa</option>
                  <option value="khalti">Khalti</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto Refund Days</label>
                <input
                  type="number"
                  value={settings.payment.autoRefundDays}
                  onChange={(e) => updateSetting('payment', 'autoRefundDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Reminder Days</label>
                <input
                  type="number"
                  value={settings.payment.paymentReminderDays}
                  onChange={(e) => updateSetting('payment', 'paymentReminderDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enabled Payment Gateways</label>
              <div className="space-y-2">
                {['esewa', 'khalti', 'bank-transfer', 'imepay'].map((gateway) => (
                  <div key={gateway} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.payment.enabledGateways.includes(gateway)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...settings.payment.enabledGateways, gateway]
                          : settings.payment.enabledGateways.filter(g => g !== gateway);
                        updateSetting('payment', 'enabledGateways', updated);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700 capitalize">
                      {gateway.replace('-', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-xs text-gray-500">Receive notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SMS Notifications</label>
                  <p className="text-xs text-gray-500">Receive notifications via SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking Alerts</label>
                  <p className="text-xs text-gray-500">Alert for new bookings</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.bookingAlerts}
                  onChange={(e) => updateSetting('notifications', 'bookingAlerts', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Alerts</label>
                  <p className="text-xs text-gray-500">Alert for payment status changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.paymentAlerts}
                  onChange={(e) => updateSetting('notifications', 'paymentAlerts', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">System Alerts</label>
                  <p className="text-xs text-gray-500">Critical system notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.systemAlerts}
                  onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Minimum Length</label>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.security.loginAttempts}
                  onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable Two-Factor Authentication
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist</label>
              <div className="space-y-2">
                {settings.security.ipWhitelist.map((ip, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={ip}
                      onChange={(e) => {
                        const updated = [...settings.security.ipWhitelist];
                        updated[index] = e.target.value;
                        updateSetting('security', 'ipWhitelist', updated);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        const updated = settings.security.ipWhitelist.filter((_, i) => i !== index);
                        updateSetting('security', 'ipWhitelist', updated);
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateSetting('security', 'ipWhitelist', [...settings.security.ipWhitelist, ''])}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add IP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Backup Settings */}
        {activeTab === 'backup' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                <select
                  value={settings.backup.backupFrequency}
                  onChange={(e) => updateSetting('backup', 'backupFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Retention Days</label>
                <input
                  type="number"
                  value={settings.backup.retentionDays}
                  onChange={(e) => updateSetting('backup', 'retentionDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.backup.autoBackup}
                  onChange={(e) => updateSetting('backup', 'autoBackup', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable Automatic Backup
                </label>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Last Backup:</strong> {settings.backup.lastBackup}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default System;