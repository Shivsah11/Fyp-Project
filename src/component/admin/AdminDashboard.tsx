import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Properties from './Properties';
import Booking from './Booking';
import Analytics from './Analytics';
import System from './System';

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
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'properties' | 'bookings' | 'analytics' | 'settings'>('dashboard');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userTab, setUserTab] = useState<'all' | 'Tenant' | 'Landlord' | 'Admin'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  const [notificationsData, setNotificationsData] = useState([
    { id: 1, text: "New user registration", time: "5 min ago", isRead: false },
    { id: 2, text: "Payment received for Property", time: "2 hours ago", isRead: false },
    { id: 3, text: "System daily backup completed", time: "Yesterday", isRead: true },
  ]);

  const handleMarkAllAsRead = () => {
    setNotificationsData(notificationsData.map(n => ({ ...n, isRead: true })));
  };

  const handleViewAllNotifications = () => {
    setIsNotificationOpen(false);
    alert('Viewing all notifications coming soon!');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

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
    <div className={`h-screen w-screen flex relative overflow-hidden bg-gray-50`}>
      {/* Background - fixed to viewport */}
      <div className="fixed inset-0 pointer-events-none bg-gray-50 z-0"></div>

      {/* Sidebar - Fixed Height */}
      <div className="relative z-20 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm h-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">SD</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Suite Dreams</h2>
              <p className="text-xs text-gray-500">Real estate management platform</p>
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
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
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

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-800 border border-gray-200 bg-white hover:border-red-400 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200"
          >
            <span>←</span>
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
        {/* Top Bar - Fixed/Sticky at its own place */}
        <div className="backdrop-blur-xl bg-white/70 px-8 py-6 border-b border-gray-200 sticky top-0 z-30 shadow-lg shadow-black/5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[20px] font-bold text-slate-800 mb-1">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">Welcome back! Manage your platform here.</p>
            </div>
            <div className="flex items-center gap-6">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notificationsData.some(n => !n.isRead) && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-[350px] bg-white border border-slate-100 shadow-lg rounded-2xl z-50 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-[15px] font-semibold text-slate-800">Notifications</h3>
                      <button onClick={handleMarkAllAsRead} className="text-[13px] text-blue-600 bg-blue-50 px-3 py-1 rounded-lg font-medium hover:bg-blue-100">
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notificationsData.map((n) => (
                        <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm text-slate-800 font-medium">{n.text}</p>
                            {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3">
                      <button onClick={handleViewAllNotifications} className="w-full py-2 text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Picker */}
              <div className="relative flex items-center bg-white text-slate-700 py-2 px-4 rounded-full text-sm font-medium shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 min-w-[150px]">
                <span>{formatDisplayDate(selectedDate)}</span>
                <svg className="w-4 h-4 ml-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                      <span className="text-xl font-semibold text-green-600">₨</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">Npr {stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm mt-1">All time revenue</p>
                </div>

                <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Active Properties</h3>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                      <span className="text-xl font-semibold text-blue-600">P</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeProperties}</p>
                  <p className="text-gray-500 text-sm mt-1">Currently listed</p>
                </div>

                <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                    <div className="w-12 h-12 bg-violet-50 rounded-full flex items-center justify-center">
                      <span className="text-xl font-semibold text-violet-600">U</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-gray-500 text-sm mt-1">{stats.totalTenants} tenants · {stats.totalLandlords} landlords</p>
                </div>

                <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Pending Verification</h3>
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                      <span className="text-xl font-semibold text-orange-600">PV</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingVerification}</p>
                  <p className="text-gray-500 text-sm mt-1">Awaiting review</p>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Revenue Analytics</h3>
                  <span className="text-gray-500 text-sm">Last 6 months</span>
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
                      <span className="text-gray-500 text-xs font-medium">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick User Overview */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Quick User Overview</h3>
                  <button
                    onClick={() => setActiveSection('users')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  >
                    Manage Users →
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="text-3xl font-bold text-emerald-700">{stats.totalTenants}</div>
                    <div className="text-sm text-emerald-600 font-medium mt-1">Tenants</div>
                    <div className="text-xs text-emerald-500 mt-0.5">Registered renters</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <div className="text-3xl font-bold text-orange-700">{stats.totalLandlords}</div>
                    <div className="text-sm text-orange-600 font-medium mt-1">Landlords</div>
                    <div className="text-xs text-orange-500 mt-0.5">Property owners</div>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                    <div className="text-3xl font-bold text-violet-700">{stats.totalUsers}</div>
                    <div className="text-sm text-violet-600 font-medium mt-1">Total Users</div>
                    <div className="text-xs text-violet-500 mt-0.5">On the platform</div>
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
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {users.length > 0
                      ? `${users.length} registered user${users.length !== 1 ? 's' : ''} on the platform`
                      : 'Loading users from database...'}
                  </p>
                </div>
                <button
                  onClick={fetchUsers}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'All Users', count: userCounts.all, color: 'bg-blue-50 border-blue-200', text: 'text-blue-700', tab: 'all' as const },
                  { label: 'Tenants', count: userCounts.Tenant, color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', tab: 'Tenant' as const },
                  { label: 'Landlords', count: userCounts.Landlord, color: 'bg-orange-50 border-orange-200', text: 'text-orange-700', tab: 'Landlord' as const },
                  { label: 'Admins', count: userCounts.Admin, color: 'bg-purple-50 border-purple-200', text: 'text-purple-700', tab: 'Admin' as const },
                ].map(({ label, count, color, text, tab }) => (
                  <button
                    key={tab}
                    onClick={() => setUserTab(tab)}
                    className={`${color} border rounded-xl p-4 text-left transition-all hover:shadow-md ${userTab === tab ? 'shadow-md ring-2 ring-offset-1 ring-current' : ''}`}
                  >
                    <div className={`text-3xl font-bold ${text}`}>{usersLoading ? '...' : count}</div>
                    <div className={`text-sm font-medium mt-1 ${text}`}>{label}</div>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
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
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500 text-sm">Loading users from database...</p>
                </div>
              )}

              {/* Users Table */}
              {!usersLoading && !usersError && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
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
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-gray-500">
                            Showing <span className="font-semibold text-gray-700">{Math.min(filteredUsers.length, (currentPage - 1) * usersPerPage + 1)}-{Math.min(filteredUsers.length, currentPage * usersPerPage)}</span> of <span className="font-semibold text-gray-700">{filteredUsers.length}</span> users
                          </p>
                          <div className="flex gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
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
  );
};

export default AdminDashboard;
