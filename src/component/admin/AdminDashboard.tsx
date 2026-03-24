import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Properties from './Properties';
import Booking from './Booking';
import Analytics from './Analytics';
import System from './System';

// Define types for user data
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'Tenant' | 'Landlord';
  isActive: boolean;
}

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'properties' | 'bookings' | 'analytics' | 'settings'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 125344,
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
  const [recentBookings] = useState([
    {
      id: 1,
      property: 'Lal 2BHK',
      tenant: 'Alex',
      date: '20dec',
      amount: '3400',
      status: 'Confirmed'
    }
  ]);

  const navigate = useNavigate();

  const menuItems: Array<{id: 'dashboard' | 'users' | 'properties' | 'bookings' | 'analytics' | 'settings'; label: string; icon: string}> = [
    { id: 'dashboard', label: 'Dashboard', icon: '' },
    { id: 'users', label: 'Users', icon: '' },
    { id: 'properties', label: 'Properties', icon: '' },
    { id: 'bookings', label: 'Bookings', icon: '' },
    { id: 'analytics', label: 'Analytics', icon: '' },
    { id: 'settings', label: 'System Settings', icon: '' },
  ];

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
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
        setStats(data.stats || {
          totalUsers: 0,
          totalTenants: 0,
          totalLandlords: 0,
          totalProperties: 0
        });
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
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
          alert('User deleted successfully');
          fetchUsers();
          fetchStats();
        } else {
          alert('Failed to delete user');
        }
      } catch (error) {
        console.error('Delete user error:', error);
        alert('Server error');
      }
    }
  };

  const handleEditUser = (userId: string) => {
    // For now, just show an alert
    alert('Edit functionality coming soon! User ID: ' + userId);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex relative overflow-hidden">
      
      {/* Clean light background */}
      <div className="absolute inset-0 fixed bg-gray-50"></div>

      {/* Modern Light Sidebar */}
      <div className="relative z-10 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo Section */}
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
        
        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02] border border-blue-400/30'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 border border-gray-300/30 hover:border-blue-500/50'
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center text-gray-500">
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-800 border-4 border-black bg-white hover:border-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200"
          >
            <span className="w-5 h-5 flex items-center justify-center text-gray-500">←</span>
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 bg-gray-50">
        {/* Clean Top Bar */}
        <div className="bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xs font-normal text-gray-700" style={{fontSize: '20px'}}>Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
                <span className="text-lg">🔔</span>
              </button>
              <div className="bg-gray-100 px-3 py-1.5 rounded">
                <span className="text-gray-600 text-sm">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {activeSection === 'dashboard' && (
            <div>
              {/* Clean Information Cards */}
              <div className="flex gap-6 mb-8">
                <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-green-600">$</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">Npr {stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-gray-600 text-sm">All time revenue</p>
                </div>

                <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Active Properties</h3>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-blue-600">P</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeProperties}</p>
                  <p className="text-gray-600 text-sm">Currently listed</p>
                </div>

                <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Pending verification</h3>
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-orange-600">PV</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingVerification}</p>
                  <p className="text-gray-600 text-sm">Awaiting review</p>
                </div>
              </div>

              {/* Clean Revenue Analytics */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Revenue Analytics</h3>
                  <span className="text-gray-600 text-sm">Last 30 days</span>
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
                      <span className="text-gray-600 text-xs font-medium">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clean Action Required and Recent Bookings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Clean Action Required */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Action Required</h3>
                    <button className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors">
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-all duration-200">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clean Recent Bookings */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Recent Bookings</h3>
                    <button className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors">
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-2 font-semibold text-sm text-gray-700">Property</th>
                          <th className="text-left p-2 font-semibold text-sm text-gray-700">Tenant</th>
                          <th className="text-left p-2 font-semibold text-sm text-gray-700">Date</th>
                          <th className="text-left p-2 font-semibold text-sm text-gray-700">Amount</th>
                          <th className="text-left p-2 font-semibold text-sm text-gray-700">Status</th>
                          <th className="text-left p-2 font-semibold text-sm text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                            <td className="p-2 text-sm text-gray-900">{booking.property}</td>
                            <td className="p-2 text-sm text-gray-900">{booking.tenant}</td>
                            <td className="p-2 text-sm text-gray-900">{booking.date}</td>
                            <td className="p-2 text-sm text-gray-900">{booking.amount}</td>
                            <td className="p-2">
                              <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                                {booking.status}
                              </span>
                            </td>
                            <td className="p-2">
                              <button className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors">
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">User Management</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">{user.firstName} {user.lastName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.userType === 'Tenant' ? 'bg-emerald-50 text-emerald-700' :
                            user.userType === 'Landlord' ? 'bg-orange-50 text-orange-700' :
                            'bg-purple-50 text-purple-700'
                          }`}>
                            {user.userType}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(user._id)}
                              className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-sm font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'properties' && (
            <Properties />
          )}

          {activeSection === 'bookings' && (
            <Booking />
          )}

          {activeSection === 'analytics' && (
            <Analytics />
          )}

          {activeSection === 'settings' && (
            <System />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
