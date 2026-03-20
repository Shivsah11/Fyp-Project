import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'tenants' | 'landlords'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTenants: 0,
    totalLandlords: 0,
    totalProperties: 0
  });

  const navigate = useNavigate();

  const menuItems: Array<{id: 'overview' | 'users' | 'tenants' | 'landlords'; label: string; icon: string}> = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'tenants', label: 'Tenants', icon: '👤' },
    { id: 'landlords', label: 'Landlords', icon: '🏠' },
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
    <div className="min-h-screen w-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 fixed">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
      <div className="relative z-10 w-80 bg-white/10 backdrop-blur-xl border-r border-white/20 flex flex-col">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          <p className="text-purple-200 text-sm mt-1">System Management</p>
        </div>
        
        <nav className="flex-1 p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-300 ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white rounded-xl transition-all duration-300"
          >
            <span>🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        {/* Top Bar */}
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/20 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {activeSection === 'overview' ? 'Dashboard Overview' :
                 activeSection === 'users' ? 'User Management' :
                 activeSection === 'tenants' ? 'Tenant Management' :
                 activeSection === 'landlords' ? 'Landlord Management' :
                 'Admin Panel'}
              </h1>
              <p className="text-purple-200 mt-1">Manage your platform efficiently</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 px-4 py-2 rounded-xl">
                <span className="text-purple-200 text-sm">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {activeSection === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Total Users</h3>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-blue-300 text-sm">All registered users</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Tenants</h3>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalTenants}</p>
                <p className="text-emerald-300 text-sm">Active tenant accounts</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Landlords</h3>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏠</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalLandlords}</p>
                <p className="text-orange-300 text-sm">Active landlord accounts</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Properties</h3>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏢</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalProperties}</p>
                <p className="text-green-300 text-sm">Total properties listed</p>
              </div>
            </div>
          )}

          {(activeSection === 'users' || activeSection === 'tenants' || activeSection === 'landlords') && (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
              <div className="p-6 border-b border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">
                  {activeSection === 'users' ? 'All Users' :
                   activeSection === 'tenants' ? 'Tenants' :
                   'Landlords'}
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-4 font-semibold">Name</th>
                      <th className="text-left p-4 font-semibold">Email</th>
                      <th className="text-left p-4 font-semibold">Type</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(user => activeSection === 'users' || user.userType === activeSection.slice(0, -1))
                      .map((user) => (
                        <tr key={user._id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span>{user.firstName} {user.lastName}</span>
                            </div>
                          </td>
                          <td className="p-4 text-purple-200">{user.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.userType === 'Tenant' ? 'bg-emerald-500/20 text-emerald-300' :
                              user.userType === 'Landlord' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-purple-500/20 text-purple-300'
                            }`}>
                              {user.userType}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditUser(user._id)}
                                className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-white rounded text-sm transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white rounded text-sm transition-colors"
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
