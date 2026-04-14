import { useState, useEffect } from 'react';
import { useDarkMode } from '../../../context/DarkModeContext';

const Settings = () => {
  const { isDarkMode, setDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences'>('profile');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    company: '',
    website: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    bookingRequests: true,
    paymentReminders: true,
    maintenanceAlerts: true,
    monthlyReports: true,
    marketingEmails: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30',
    passwordExpiry: '90'
  });

  const [preferences, setPreferences] = useState({
    language: 'english',
    timezone: 'Asia/Kathmandu',
    currency: 'NPR',
    dateFormat: 'DD/MM/YYYY',
    darkMode: isDarkMode
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        const u = data.user;
        setFormData({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          phone: u.phone || '',
          address: u.address || '',
          bio: u.bio || '',
          company: u.preferences?.company || '',
          website: u.preferences?.website || ''
        });
        if (u.preferences) {
          setNotificationSettings(prev => ({ ...prev, ...u.preferences }));
          setSecuritySettings(prev => ({ ...prev, ...u.preferences }));
          setPreferences(prev => ({ ...prev, ...u.preferences, darkMode: isDarkMode }));
        }
      } else {
        console.error('Failed to fetch profile:', data.message);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Update basic profile
      const profResp = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio
        })
      });

      // Update secondary preferences (company, website)
      await fetch('http://localhost:5000/api/users/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          company: formData.company,
          website: formData.website
        })
      });

      if (profResp.ok) {
        alert('Profile updated successfully!');
      } else {
        const data = await profResp.json();
        alert(`Failed to update: ${data.message || 'Error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Connection error while updating profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      alert('All password fields are required!');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Password changed successfully!');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Connection error while changing password');
    }
  };

  const savePreferences = async (newPrefs: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPrefs)
      });
      if (!response.ok) console.error('Failed to auto-save preferences');
    } catch (error) {
      console.error('Error auto-saving preferences:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
    { id: 'preferences', label: 'Preferences' }
  ];

  const inputClasses = `w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 ${
    isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
      : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
  }`;

  const labelClasses = `block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Settings</h3>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-700'}>Manage your account settings and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64">
          <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg border border-emerald-400/30'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 hover:border-gray-500'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Information */}
              <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Profile Information</h4>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows={3}
                      className={inputClasses}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Company</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Website</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30"
                  >
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Change Password</h4>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className={labelClasses}>Current Password</label>
                    <input
                      type="password"
                      className={inputClasses}
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>New Password</label>
                    <input
                      type="password"
                      className={inputClasses}
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Confirm New Password</label>
                    <input
                      type="password"
                      className={inputClasses}
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Notification Preferences</h4>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
                    { key: 'bookingRequests', label: 'Booking Requests', description: 'Get notified about new booking requests' },
                    { key: 'paymentReminders', label: 'Payment Reminders', description: 'Reminders for upcoming rent payments' },
                    { key: 'maintenanceAlerts', label: 'Maintenance Alerts', description: 'Alerts for maintenance requests' },
                    { key: 'monthlyReports', label: 'Monthly Reports', description: 'Receive monthly performance reports' },
                    { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional offers and updates' }
                  ].map((item) => (
                    <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div>
                        <h5 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{item.label}</h5>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setNotificationSettings({...notificationSettings, [item.key]: val});
                            savePreferences({ [item.key]: val });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-blue-700 border-2 border-gray-400"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Security Settings</h4>
                <div className="space-y-4">
                  {[
                    { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account' },
                    { key: 'loginAlerts', label: 'Login Alerts', description: 'Get notified when someone logs into your account' }
                  ].map((item) => (
                    <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div>
                        <h5 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{item.label}</h5>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!securitySettings[item.key as keyof typeof securitySettings]}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setSecuritySettings({...securitySettings, [item.key]: val});
                            savePreferences({ [item.key]: val });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-blue-700 border-2 border-gray-400"></div>
                      </label>
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Session Timeout (minutes)</label>
                      <select
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                        className={inputClasses}
                      >
                        <option value="15" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>15 minutes</option>
                        <option value="30" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>30 minutes</option>
                        <option value="60" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>1 hour</option>
                        <option value="120" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>2 hours</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>Password Expiry (days)</label>
                      <select
                        value={securitySettings.passwordExpiry}
                        onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: e.target.value})}
                        className={inputClasses}
                      >
                        <option value="30" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>30 days</option>
                        <option value="60" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>60 days</option>
                        <option value="90" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>90 days</option>
                        <option value="180" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>180 days</option>
                        <option value="365" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>1 year</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Preferences</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Language</label>
                      <select
                        value={preferences.language}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPreferences({...preferences, language: val});
                          savePreferences({ language: val });
                        }}
                        className={inputClasses}
                      >
                        <option value="english" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>English</option>
                        <option value="nepali" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>नेपाली</option>
                        <option value="hindi" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>हिन्दी</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>Timezone</label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPreferences({...preferences, timezone: val});
                          savePreferences({ timezone: val });
                        }}
                        className={inputClasses}
                      >
                        <option value="Asia/Kathmandu" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>Asia/Kathmandu</option>
                        <option value="Asia/Delhi" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>Asia/Delhi</option>
                        <option value="Asia/Dubai" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>Asia/Dubai</option>
                        <option value="UTC" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>UTC</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Currency</label>
                      <select
                        value={preferences.currency}
                        onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                        className={inputClasses}
                      >
                        <option value="NPR" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>NPR - Nepalese Rupee</option>
                        <option value="USD" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>USD - US Dollar</option>
                        <option value="EUR" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>EUR - Euro</option>
                        <option value="INR" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>INR - Indian Rupee</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>Date Format</label>
                      <select
                        value={preferences.dateFormat}
                        onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                        className={inputClasses}
                      >
                        <option value="DD/MM/YYYY" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div>
                      <h5 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Dark Mode</h5>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Use dark theme across the application</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={(e) => {
                          const newDarkMode = e.target.checked;
                          setPreferences({...preferences, darkMode: newDarkMode});
                          setDarkMode(newDarkMode);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-blue-700 border-2 border-gray-400"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
