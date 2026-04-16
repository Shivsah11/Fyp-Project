import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../context/DarkModeContext';
import Properties from './Properties';
import Booking from './Booking';
import Analytics from './Analytics';
import System from './System';
import { NotificationProvider } from '../../context/NotificationContext';
import NotificationDropdown from '../Shared/NotificationDropdown';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType: 'Tenant' | 'Landlord' | 'Admin';
  isActive: boolean;
  createdAt?: string;
}

const AdminDashboard = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'properties' | 'bookings' | 'analytics' | 'settings'>('dashboard');

  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userTab, setUserTab] = useState<'all' | 'Tenant' | 'Landlord' | 'Admin'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localDate = new Date(today.getTime() - offset);
    return localDate.toISOString().split('T')[0];
  });

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Select Date';
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeProperties: 0,
    pendingVerification: 0,
    totalUsers: 0,
    totalTenants: 0,
    totalLandlords: 0,
    totalProperties: 0
  });

  const [revenueData] = useState([
    { month: 'Jan', revenue: 85000 },
    { month: 'Feb', revenue: 92000 },
    { month: 'Mar', revenue: 78000 },
    { month: 'Apr', revenue: 105000 },
    { month: 'May', revenue: 118000 },
    { month: 'Jun', revenue: 125344 }
  ]);

  const navigate = useNavigate();

  const menuItems: Array<{ id: 'dashboard' | 'users' | 'properties' | 'bookings' | 'analytics' | 'settings'; label: string }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Users' },
    { id: 'properties', label: 'Properties' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'System Settings' },
  ];

  // Fetch users
  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUsersError('Not authenticated. Please log in as admin.');
        setUsersLoading(false);
        return;
      }
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        const errData = await response.json().catch(() => ({}));
        setUsersError(errData.message || `Failed to fetch users (${response.status}). Make sure you are logged in as Admin.`);
      }
    } catch (error) {
      setUsersError('Network error: Could not connect to the backend server.');
      console.error('Fetch users error:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({ ...prev, ...(data.stats || {}) }));
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch users when users tab is activated
  useEffect(() => {
    if (activeSection === 'users') {
      fetchUsers();
    }
  }, [activeSection]);

  // Reset pagination when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [userTab, userSearch]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleDeleteUser = async (userId: string, _userType: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        fetchStats();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      alert('Server error');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = !user.isActive;
      const response = await fetch(`http://localhost:5000/api/admin/users/${user._id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: newStatus, userType: user.userType }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: newStatus } : u));
      } else {
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      alert('Server error');
    }
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchType = userTab === 'all' || u.userType === userTab;
    const q = userSearch.toLowerCase();
    const matchSearch = !q ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  // Pagination logic
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const userCounts = {
    all: users.length,
    Tenant: users.filter(u => u.userType === 'Tenant').length,
    Landlord: users.filter(u => u.userType === 'Landlord').length,
    Admin: users.filter(u => u.userType === 'Admin').length,
  };

  const getUserTypeStyle = (type: string) => {
    switch (type) {
      case 'Tenant': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Landlord': return 'bg-orange-50 text-orangeald-700 border border-orange-200';
      case 'Admin': return 'bg-purple-50 text-purple-700 border border-purple-200';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getUserAvatar = (type: string) => {
    switch (type) {
      case 'Tenant': return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
      case 'Landlord': return { bg: 'bg-orange-100', text: 'text-orange-700' };
      case 'Admin': return { bg: 'bg-purple-100', text: 'text-purple-700' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <NotificationProvider userType="Admin">
      <div className={`h-screen w-screen flex relative overflow-hidden ${isDarkMode ? 'bg-[#121416]' : 'bg-gray-50'}`}>
        {/* Background - fixed to viewport */}
        <div className={`fixed inset-0 pointer-events-none z-0 ${isDarkMode ? 'bg-[#121416]' : 'bg-gray-50'}`}></div>

        {/* Sidebar - Fixed Height */}
        <div className={`relative z-20 w-64 ${isDarkMode ? 'bg-[#1a1c1e] border-gray-800' : 'bg-white border-gray-200'} border-r flex flex-col shadow-sm h-full`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">SD</span>
              </div>
              <div>
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Suite Dreams</h2>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Real estate management platform</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                    : `${isDarkMode ? 'text-gray-400 hover:bg-gray-800/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'}`
                    }`}
                >
                  <span>{item.label}</span>
                  {item.id === 'users' && userCounts.all > 0 && (
                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${activeSection === 'users' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                      {userCounts.all}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold border transition-all duration-200 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50' 
                  : 'bg-white text-gray-800 border-gray-200 hover:border-red-400 hover:bg-red-50 hover:text-red-700'
              }`}
            >
              <span>←</span>
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
          {/* Top Bar - Fixed/Sticky at its own place */}
          <div className={`${isDarkMode ? 'bg-[#1a1c1e] border-gray-800' : 'bg-white border-gray-200'} px-8 py-5 border-b sticky top-0 z-30 transition-colors duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-[20px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-1`}>Admin Dashboard</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Welcome back! Manage your platform here.</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Theme Toggle Button - Matching Sample */}
                <button 
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.242 19.071l-.707-.707M7.757 7.757l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>

                {/* Notifications */}
                <NotificationDropdown />

                {/* Date Picker Pill - Matching Sample */}
                <div className={`relative flex items-center ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'} py-2 px-5 rounded-full text-sm font-medium shadow-sm border transition-all cursor-pointer min-w-[160px]`}>
                  <span>{formatDisplayDate(selectedDate)}</span>
                  <svg className={`w-4 h-4 ml-3 ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto p-8">

            {/* ── Dashboard Overview ── */}
            {activeSection === 'dashboard' && (
              <div>
                <div className="flex gap-6 mb-8">
                  <div className={`flex-1 ${isDarkMode ? 'bg-[#1a1c1e] border-gray-800' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Total Revenue</h3>
                      <div className={`w-12 h-12 ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'} rounded-full flex items-center justify-center`}>
                        <span className={`text-xl font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>₨</span>
                      </div>
                    </div>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Npr {stats.totalRevenue.toLocaleString()}</p>
                    <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} text-sm mt-1`}>All time revenue</p>
                  </div>

                  <div className={`flex-1 ${isDarkMode ? 'bg-[#1a1c1e] border-gray-800' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Active Properties</h3>
                      <div className={`w-12 h-12 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-full flex items-center justify-center`}>
                        <span className={`text-xl font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>P</span>
                      </div>
                    </div>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.activeProperties}</p>
                    <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} text-sm mt-1`}>Currently listed</p>
                  </div>

                  <div className={`flex-1 ${isDarkMode ? 'bg-[#1a1c1e] border-gray-800' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Total Users</h3>
                      <div className={`w-12 h-12 ${isDarkMode ? 'bg-violet-900/20' : 'bg-violet-50'} rounded-full flex items-center justify-center`}>
                        <span className={`text-xl font-semibold ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>U</span>
                      </div>
                    </div>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</p>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>{stats.totalTenants} tenants · {stats.totalLandlords} landlords</p>
                  </div>

                  <div className={`flex-1 ${isDarkMode ? 'bg-[#1a1c1e] border-gray-800' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Pending Verification</h3>
                      <div className={`w-12 h-12 ${isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'} rounded-full flex items-center justify-center`}>
                        <span className={`text-xl font-semibold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>PV</span>
                      </div>
                    </div>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.pendingVerification}</p>
                    <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} text-sm mt-1`}>Awaiting review</p>
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className={`${isDarkMode ? 'bg-[#1a1c1e] border-gray-800' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm mb-8`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Revenue Analytics</h3>
                    <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} text-sm`}>Last 6 months</span>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-4">
                    {revenueData.map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t-lg transition-all duration-200 hover:from-teal-400 hover:to-cyan-300"
                          style={{
                            height: `${(data.revenue / Math.max(...revenueData.map(d => d.revenue))) * 100}%`,
                            minHeight: '20px'
                          }}
                        ></div>
                        <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} text-xs font-medium`}>{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick User Overview */}
                <div className={`${isDarkMode ? 'bg-[#1a1c1e] border-gray-800' : 'bg-white border-gray-200'} rounded-xl p-6 border shadow-sm`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Quick User Overview</h3>
                    <button
                      onClick={() => setActiveSection('users')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      Manage Users →
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`${isDarkMode ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'} rounded-xl p-4 border`}>
                      <div className={`text-3xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{stats.totalTenants}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'} font-medium mt-1`}>Tenants</div>
                      <div className={`text-xs ${isDarkMode ? 'text-emerald-600/70' : 'text-emerald-500'} mt-0.5`}>Registered renters</div>
                    </div>
                    <div className={`${isDarkMode ? 'bg-orange-900/10 border-orange-900/30' : 'bg-orange-50 border-orange-100'} rounded-xl p-4 border`}>
                      <div className={`text-3xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>{stats.totalLandlords}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-orange-500' : 'text-orange-600'} font-medium mt-1`}>Landlords</div>
                      <div className={`text-xs ${isDarkMode ? 'text-orange-600/70' : 'text-orange-500'} mt-0.5`}>Property owners</div>
                    </div>
                    <div className={`${isDarkMode ? 'bg-violet-900/10 border-violet-900/30' : 'bg-violet-50 border-violet-100'} rounded-xl p-4 border`}>
                      <div className={`text-3xl font-bold ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`}>{stats.totalUsers}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-violet-500' : 'text-violet-600'} font-medium mt-1`}>Total Users</div>
                      <div className={`text-xs ${isDarkMode ? 'text-violet-600/70' : 'text-violet-500'} mt-0.5`}>On the platform</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Users Management ── */}
            {activeSection === 'users' && (
              <div className="space-y-6">
                {/* Header + counts */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User Management</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      {users.length > 0
                        ? `${users.length} registered user${users.length !== 1 ? 's' : ''} on the platform`
                        : 'Loading users from database...'}
                    </p>
                  </div>
                  <button
                    onClick={fetchUsers}
                    className={`flex items-center gap-2 px-4 py-2 transition-colors text-sm font-medium rounded-lg border ${
                      isDarkMode 
                        ? 'bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 border-blue-900/50' 
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'All Users', count: userCounts.all, color: isDarkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-200', text: isDarkMode ? 'text-blue-400' : 'text-blue-700', tab: 'all' as const },
                    { label: 'Tenants', count: userCounts.Tenant, color: isDarkMode ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-200', text: isDarkMode ? 'text-emerald-400' : 'text-emerald-700', tab: 'Tenant' as const },
                    { label: 'Landlords', count: userCounts.Landlord, color: isDarkMode ? 'bg-orange-900/10 border-orange-900/30' : 'bg-orange-50 border-orange-200', text: isDarkMode ? 'text-orange-400' : 'text-orange-700', tab: 'Landlord' as const },
                    { label: 'Admins', count: userCounts.Admin, color: isDarkMode ? 'bg-purple-900/10 border-purple-900/30' : 'bg-purple-50 border-purple-200', text: isDarkMode ? 'text-purple-400' : 'text-purple-700', tab: 'Admin' as const },
                  ].map(({ label, count, color, text, tab }) => (
                    <button
                      key={tab}
                      onClick={() => setUserTab(tab)}
                      className={`${color} border rounded-xl p-4 text-left transition-all hover:shadow-md ${userTab === tab ? `shadow-md ring-2 ring-offset-1 ${isDarkMode ? 'ring-blue-500/50 ring-offset-[#121416]' : 'ring-current ring-offset-white'}` : ''}`}
                    >
                      <div className={`text-3xl font-bold ${text}`}>{usersLoading ? '...' : count}</div>
                      <div className={`text-sm font-medium mt-1 ${text}`}>{label}</div>
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className={`${isDarkMode ? 'bg-[#1a1c1e] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border shadow-sm p-4`}>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-800/50 border-gray-700 text-gray-200 placeholder-gray-500' 
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>
                    {/* Tab pills */}
                    <div className="flex gap-2">
                      {(['all', 'Tenant', 'Landlord', 'Admin'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setUserTab(tab)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${userTab === tab
                            ? 'bg-blue-600 text-white'
                            : isDarkMode 
                                ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {tab === 'all' ? 'All' : tab + 's'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Error state */}
                {usersError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-red-800 font-medium text-sm">Failed to load users</p>
                      <p className="text-red-600 text-sm mt-0.5">{usersError}</p>
                      <button onClick={fetchUsers} className="mt-2 text-red-700 underline text-sm hover:text-red-900">Try again</button>
                    </div>
                  </div>
                )}

                {/* Loading */}
                {usersLoading && (
                  <div className={`${isDarkMode ? 'bg-[#1a1c1e] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border shadow-sm p-12 flex flex-col items-center justify-center`}>
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Loading users from database...</p>
                  </div>
                )}

                {/* Users Table */}
                {!usersLoading && !usersError && (
                  <div className={`${isDarkMode ? 'bg-[#1a1c1e] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
                    {filteredUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h3 className="text-gray-800 font-semibold text-lg mb-1">
                          {users.length === 0 ? 'No users registered yet' : 'No users match your search'}
                        </h3>
                        <p className="text-gray-500 text-sm text-center max-w-sm">
                          {users.length === 0
                            ? 'When users register on the platform as Tenants or Landlords, they will appear here.'
                            : 'Try adjusting your search term or filter selection.'}
                        </p>
                        {users.length === 0 && (
                          <button onClick={fetchUsers} className="mt-4 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 transition-colors">
                            Refresh List
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                            <tr>
                              <th className={`text-left px-6 py-3 text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>User</th>
                              <th className={`text-left px-6 py-3 text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Email</th>
                              <th className={`text-left px-6 py-3 text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Type</th>
                              <th className={`text-left px-6 py-3 text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                              <th className={`text-left px-6 py-3 text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Joined</th>
                              <th className={`text-left px-6 py-3 text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                            {paginatedUsers.map((user) => {
                              const avatar = getUserAvatar(user.userType);
                              const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
                              return (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-9 h-9 ${avatar.bg} ${avatar.text} rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                                        {initials}
                                      </div>
                                      <div>
                                        <div className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                                        {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getUserTypeStyle(user.userType)}`}>
                                      {user.userType}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${user.isActive
                                      ? 'bg-green-50 text-green-700 border-green-200'
                                      : 'bg-red-50 text-red-700 border-red-200'}`}>
                                      {user.isActive ? '● Active' : '● Inactive'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                                  <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleToggleStatus(user)}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${user.isActive
                                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                                          : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'}`}
                                      >
                                        {user.isActive ? 'Deactivate' : 'Activate'}
                                      </button>
                                      {user.userType !== 'Admin' && (
                                        <button
                                          onClick={() => handleDeleteUser(user._id, user.userType)}
                                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-xs font-medium transition-colors"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Table Footer */}
                        <div className={`px-6 py-4 ${isDarkMode ? 'bg-[#1a1c1e] border-gray-800' : 'bg-gray-50 border-gray-200'} border-t flex flex-col md:flex-row items-center justify-between gap-4`}>
                          <div className="flex flex-col gap-1">
                            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              Showing <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{Math.min(filteredUsers.length, (currentPage - 1) * usersPerPage + 1)}-{Math.min(filteredUsers.length, currentPage * usersPerPage)}</span> of <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{filteredUsers.length}</span> users
                            </p>
                            <div className={`flex gap-3 text-[10px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} font-bold uppercase tracking-widest`}>
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {userCounts.Tenant} Tenants
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> {userCounts.Landlord} Landlords
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> {userCounts.Admin} Admins
                              </span>
                            </div>
                          </div>

                          {/* Pagination Controls */}
                          {totalUserPages > 1 && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg border transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed border-gray-100' : 'hover:bg-gray-100 border-gray-200 text-gray-600'}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                              </button>

                              <div className="flex items-center gap-1 mx-1">
                                {[...Array(totalUserPages)].map((_, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1
                                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md ring-2 ring-blue-500/20'
                                      : 'hover:bg-gray-100 text-gray-600 border border-transparent'}`}
                                  >
                                    {i + 1}
                                  </button>
                                ))}
                              </div>

                              <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalUserPages))}
                                disabled={currentPage === totalUserPages}
                                className={`p-2 rounded-lg border transition-all ${currentPage === totalUserPages ? 'opacity-50 cursor-not-allowed border-gray-100' : 'hover:bg-gray-100 border-gray-200 text-gray-600'}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'properties' && <Properties />}
            {activeSection === 'bookings' && <Booking />}
            {activeSection === 'analytics' && <Analytics />}
            {activeSection === 'settings' && <System />}
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default AdminDashboard;
