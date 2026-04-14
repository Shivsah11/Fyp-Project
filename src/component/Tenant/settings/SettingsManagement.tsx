import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../../context/DarkModeContext';

interface SettingsSection {
  id: string;
  title: string;
  icon: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  label: string;
  type: 'toggle' | 'input' | 'select' | 'textarea' | 'button';
  value?: string | boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  description?: string;
}

const SettingsManagement: React.FC = () => {
  const { isDarkMode, setDarkMode } = useDarkMode();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    language: 'english',
    timezone: 'Asia/Kathmandu',
    theme: 'dark'
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
        setFormData(prev => ({
          ...prev,
          ...data.user,
          ...data.user.preferences
        }));
      } else {
        console.error(`Failed to fetch profile: ${response.status} ${data.message}`);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: '👤',
      items: [
        { id: 'firstName', label: 'First Name', type: 'input', value: formData.firstName, placeholder: 'Enter your first name' },
        { id: 'lastName', label: 'Last Name', type: 'input', value: formData.lastName, placeholder: 'Enter your last name' },
        { id: 'email', label: 'Email Address', type: 'input', value: formData.email, placeholder: 'Enter your email' },
        { id: 'phone', label: 'Phone Number', type: 'input', value: formData.phone, placeholder: 'Enter your phone number' },
        { id: 'address', label: 'Address', type: 'input', value: formData.address, placeholder: 'Enter your address' },
        { id: 'bio', label: 'Bio', type: 'textarea', value: formData.bio, placeholder: 'Tell us about yourself' }
      ]
    },
    {
      id: 'security',
      title: 'Security',
      icon: '🔐',
      items: [
        { id: 'currentPassword', label: 'Current Password', type: 'input', value: formData.currentPassword, placeholder: 'Enter current password' },
        { id: 'newPassword', label: 'New Password', type: 'input', value: formData.newPassword, placeholder: 'Enter new password' },
        { id: 'confirmPassword', label: 'Confirm New Password', type: 'input', value: formData.confirmPassword, placeholder: 'Confirm new password' }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: '�',
      items: [
        { id: 'notifications', label: 'Push Notifications', type: 'toggle', value: formData.notifications, description: 'Receive push notifications on your device' },
        { id: 'emailAlerts', label: 'Email Alerts', type: 'toggle', value: formData.emailAlerts, description: 'Receive important updates via email' },
        { id: 'smsAlerts', label: 'SMS Alerts', type: 'toggle', value: formData.smsAlerts, description: 'Get text messages for urgent matters' }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: '⚙️',
      items: [
        {
          id: 'language',
          label: 'Language',
          type: 'select',
          value: formData.language,
          options: [
            { value: 'english', label: 'English' },
            { value: 'nepali', label: 'Nepali' },
            { value: 'hindi', label: 'Hindi' }
          ]
        },
        {
          id: 'timezone',
          label: 'Timezone',
          type: 'select',
          value: formData.timezone,
          options: [
            { value: 'Asia/Kathmandu', label: 'Kathmandu (GMT+5:45)' },
            { value: 'Asia/Delhi', label: 'Delhi (GMT+5:30)' },
            { value: 'UTC', label: 'UTC (GMT+0)' }
          ]
        },
        {
          id: 'theme',
          label: 'Dark Mode',
          type: 'toggle',
          value: isDarkMode,
          description: 'Use dark theme across the application'
        }
      ]
    }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Handle dark mode toggle specifically
    if (field === 'theme') {
      setDarkMode(value as boolean);
    }
  };

  const handleSaveSection = async (sectionId: string) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = 'http://localhost:5000/api/users/profile';
      let method = 'PUT';
      let payload = {};

      if (sectionId === 'profile') {
        payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio
        };
      } else if (sectionId === 'notifications' || sectionId === 'preferences') {
        endpoint = 'http://localhost:5000/api/users/preferences';
        method = 'PATCH';
        payload = sectionId === 'notifications' 
          ? { 
              notifications: formData.notifications, 
              emailAlerts: formData.emailAlerts, 
              smsAlerts: formData.smsAlerts 
            }
          : { 
              language: formData.language, 
              timezone: formData.timezone, 
              theme: formData.theme 
            };
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        alert(`${settingsSections.find(s => s.id === sectionId)?.title} saved successfully!`);
      } else {
        alert(`Failed to save: ${response.status} ${data.message || 'Error'}`);
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(`Connection Error: ${error.message}. Please ensure the backend is running.`);
    }
  };

  const handlePasswordChange = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      alert('All password fields are required!');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (formData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
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
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Password changed successfully!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error connecting to server');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your data. Are you absolutely sure?')) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/users/account', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            alert('Account deleted successfully. You will be logged out.');
            localStorage.clear();
            window.location.href = '/login';
          } else {
            const data = await response.json();
            alert(data.message || 'Failed to delete account');
          }
        } catch (error) {
          console.error('Error deleting account:', error);
          alert('Error connecting to server');
        }
      }
    }
  };

  const renderSettingItem = (item: SettingsItem) => {
    switch (item.type) {
      case 'toggle':
        return (
          <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
            }`}>
            <div>
              <h5 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{item.label}</h5>
              {item.description && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={item.value as boolean}
                onChange={(e) => handleInputChange(item.id, e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-14 h-7 rounded-full peer transition-all duration-300 ${isDarkMode
                  ? 'bg-gray-600 border-2 border-gray-500 peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-blue-700'
                  : 'bg-gray-300 border-2 border-gray-400 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600'
                } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300`}>
                <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-6 w-6 transition-all duration-300 peer-checked:translate-x-7 border-2 ${isDarkMode ? 'border-gray-400' : 'border-gray-300'
                  }`}></div>
              </div>
            </label>
          </div>
        );

      case 'select':
        return (
          <div>
            <label className={`block font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</label>
            <select
              value={(item.value as string) || ''}
              onChange={(e) => handleInputChange(item.id, e.target.value)}
              className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600'
                  : 'bg-white border-gray-400 text-gray-900 hover:bg-gray-50 shadow-sm'
                }`}
            >
              {item.options?.map((option) => (
                <option key={option.value} value={option.value} className="bg-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'textarea':
        return (
          <div>
            <label className={`block font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</label>
            <textarea
              value={(item.value as string) || ''}
              onChange={(e) => handleInputChange(item.id, e.target.value)}
              placeholder={item.placeholder}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400/60 hover:bg-gray-600'
                  : 'bg-white border-gray-400 text-gray-900 placeholder-gray-500 hover:bg-gray-50 shadow-sm'
                }`}
            />
          </div>
        );

      default: // input
        return (
          <div>
            <label className={`block font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</label>
            <input
              type={item.id.includes('Password') ? 'password' : 'text'}
              value={(item.value as string) || ''}
              onChange={(e) => handleInputChange(item.id, e.target.value)}
              placeholder={item.placeholder}
              className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400/60 hover:bg-gray-600'
                  : 'bg-white border-gray-400 text-gray-900 placeholder-gray-500 hover:bg-gray-50 shadow-sm'
                }`}
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>Settings</h2>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Manage your account settings and preferences</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className={`rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            <nav className="p-4">
              <ul className="space-y-2">
                {settingsSections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeSection === section.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                        }`}
                    >
                      <span className="text-xl">{section.icon}</span>
                      <span className="font-medium">{section.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <div className={`rounded-xl border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300 shadow-md'
            }`}>
            <div className="p-6">
              {/* Section Header */}
              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {settingsSections.find(s => s.id === activeSection)?.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {activeSection === 'profile' && 'Update your personal information and profile details'}
                  {activeSection === 'security' && 'Manage your password and security settings'}
                  {activeSection === 'notifications' && 'Control how you receive notifications and alerts'}
                  {activeSection === 'preferences' && 'Customize your app experience and preferences'}
                </p>
              </div>

              {/* Settings Form */}
              <div className="space-y-6">
                {settingsSections
                  .find(s => s.id === activeSection)
                  ?.items.map((item) => (
                    <div key={item.id} className={`pb-6 last:border-0 ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'
                      }`}>
                      {renderSettingItem(item)}
                    </div>
                  ))}

                {/* Section-specific actions */}
                {activeSection === 'security' && (
                  <div className={`pt-6 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'
                    }`}>
                    <button
                      onClick={handlePasswordChange}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                    >
                      Change Password
                    </button>
                  </div>
                )}

                {activeSection === 'profile' && (
                  <div className={`pt-6 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'
                    }`}>
                    <button
                      onClick={() => handleSaveSection('profile')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div className={`pt-6 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'
                    }`}>
                    <button
                      onClick={() => handleSaveSection('notifications')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                    >
                      Save Notification Settings
                    </button>
                  </div>
                )}

                {activeSection === 'preferences' && (
                  <div className={`pt-6 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'
                    }`}>
                    <button
                      onClick={() => handleSaveSection('preferences')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                    >
                      Save Preferences
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          {activeSection === 'security' && (
            <div className={`mt-6 rounded-xl border p-6 ${isDarkMode
                ? 'bg-red-900/20 border-red-800'
                : 'bg-red-50 border-red-300'
              }`}>
              <h4 className={`font-bold text-lg mb-3 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Danger Zone</h4>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                Irreversible and destructive actions. Please be careful.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;
