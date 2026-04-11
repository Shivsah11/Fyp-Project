import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Bookings from './Bookings';
import Messages from './Messages';
import Settings from './Setting';
import PaymentHistory from '../PaymentHistory';
import PropertyMap from '../../Shared/PropertyMap';
import { useDarkMode } from '../../../context/DarkModeContext';

const LandlordDashboard = () => {
  const { isDarkMode } = useDarkMode();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Landlord');
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [propertyName, setPropertyName] = useState('');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [propertyPrice, setPropertyPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [propertyStatus, setPropertyStatus] = useState('');
  const [propertyImages, setPropertyImages] = useState<{ [key: number]: string }>({});
  const [newPropertyImages, setNewPropertyImages] = useState<string[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalIncome: 0,
    totalProperties: 0,
    occupiedProperties: 0,
    pendingBookings: 0,
    monthlyRevenue: [0, 0, 0, 0, 0, 0],
    occupancyRate: 0,
    averageRent: 0,
    totalTenants: 0
  });

  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [messages] = useState<any[]>([
    { id: 1, sender: 'John Doe', subject: 'Maintenance Request', time: '2 hours ago', unread: true },
    { id: 2, sender: 'Jane Smith', subject: 'Payment Confirmation', time: '5 hours ago', unread: false },
  ]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'properties', label: 'Properties' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'payments', label: 'Payments' },
    { id: 'messages', label: 'Messages' },
    { id: 'settings', label: 'Settings' },
  ];

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await fetch('http://localhost:5000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const { user, analytics: apiAnalytics, recentBookings: apiBookings, properties: apiProperties } = result.data;

        setUserName(user?.firstName || 'Landlord');
        if (apiAnalytics) {
          setAnalytics({
            ...analytics,
            totalIncome: apiAnalytics.totalIncome || 0,
            totalProperties: apiAnalytics.totalProperties || 0,
            totalTenants: apiAnalytics.activeTenants || 0,
            pendingBookings: apiAnalytics.pendingRequests || 0,
          });
        }
        setRecentBookings(apiBookings || []);
        setProperties(apiProperties || []);
      }
    } catch (error) {
      console.error('Fetch landlord dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to add a property');
        return;
      }

      const typeMap: { [key: string]: string } = {
        'Studio': 'studio',
        '1 Bedroom': 'room',
        '2 Bedroom': 'apartment',
        '3 Bedroom': 'house'
      };

      const propertyData = {
        title: propertyName,
        location: propertyLocation,
        price: `NPR ${propertyPrice}`,
        type: typeMap[propertyType] || 'apartment',
        status: 'Available',
        image: newPropertyImages.length > 0 ? newPropertyImages[0] : '',
        description: `${propertyName} located in ${propertyLocation}. A fine ${propertyType} property.`,
        beds: propertyType.includes('Bedroom') ? parseInt(propertyType) : (propertyType === 'Studio' ? 0 : 1),
        baths: 1,
        area: 0,
        amenities: []
      };

      const response = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (response.ok) {
        alert(`Property "${propertyName}" added successfully!`);
        setShowAddForm(false);
        // Reset form
        setPropertyName('');
        setPropertyLocation('');
        setPropertyPrice('');
        setPropertyType('');
        setNewPropertyImages([]);
        // Refresh data
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Failed to add property: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding property:', error);
      alert(`An error occurred while adding the property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoordinates({ lat, lng });
    // Reverse geocode to get address (optional - for demo we'll use coordinates)
    setPropertyLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    setShowMapPicker(false);
  };

  const deleteProperty = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Property deleted successfully');
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete property: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('An error occurred while deleting the property');
    }
  };

  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const imageReaders: Promise<string>[] = [];

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        const promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
        imageReaders.push(promise);
      });

      Promise.all(imageReaders).then((images) => {
        setNewPropertyImages(prev => [...prev, ...images]);
        alert(`${images.length} room images added successfully!`);
      });
    }
  };

  const removeNewPropertyImage = (index: number) => {
    setNewPropertyImages(prev => prev.filter((_, i) => i !== index));
  };



  const handlePropertyImageUpload = (e: React.ChangeEvent<HTMLInputElement>, propertyId: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setPropertyImages(prev => ({ ...prev, [propertyId]: imageUrl }));
        // Store in localStorage for persistence
        const storedImages = JSON.parse(localStorage.getItem('propertyImages') || '{}');
        storedImages[propertyId] = imageUrl;
        localStorage.setItem('propertyImages', JSON.stringify(storedImages));
        alert('Room image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Load stored property images on mount
  useEffect(() => {
    const storedImages = JSON.parse(localStorage.getItem('propertyImages') || '{}');
    setPropertyImages(storedImages);
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen w-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`text-xl font-semibold animate-pulse ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading Landlord Dashboard...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-screen flex relative overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

      {/* Animated background elements */}
      <div className="absolute inset-0 fixed">
        <div className={`absolute top-20 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100/30'}`}></div>
        <div className={`absolute bottom-20 right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000 ${isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-100/30'}`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000 ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-100/30'}`}></div>
      </div>

      {/* Sidebar */}
      <div className={`relative z-10 w-64 min-h-screen border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Logo */}
        <div className={`px-6 py-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h1 className={`text-[20px] font-extrabold tracking-wide ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            SUITE DREAMS
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Landlord Portal</p>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeSection === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02] border border-blue-400/30'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400 border border-gray-600/30 hover:border-blue-500/50'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 border border-gray-300/30 hover:border-blue-500/50'
                    }`}
                >
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-20 left-6 right-6">
          <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                A
              </div>
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Alex</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <Link
            to="/"
            className={`w-full py-3 rounded-xl font-medium transition-all duration-300 border flex items-center justify-center gap-2 ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
            }`}
          >
            <span>Logout</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 relative z-10 overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Top Bar */}
        <div className={`px-8 py-6 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-extrabold mb-1 tracking-wide ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {activeSection === 'dashboard' ? `Welcome Back, ${userName}` :
                  activeSection === 'properties' ? 'My Properties' :
                    activeSection === 'analytics' ? 'Analytics Dashboard' :
                      activeSection === 'bookings' ? 'Booking Requests' :
                        activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </h2>
            </div>
            {activeSection === 'dashboard' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveSection('analytics')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-blue-400/30"
                >
                  View Analytics
                </button>
                <button
                  onClick={() => setActiveSection('properties')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-blue-400/30"
                >
                  + Add Property
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content based on active section */}
        {activeSection === 'dashboard' ? (
          <div className="p-6">
            {/* Square Info Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`rounded-xl border p-6 h-40 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Income</p>
                    <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>NPR {analytics.totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-500/20 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl border p-6 h-40 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Tenants</p>
                    <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{analytics.totalTenants}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-600 text-xs rounded-full border border-blue-400/30">occupied</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`rounded-xl border p-6 h-40 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Requests</p>
                    <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{analytics.pendingBookings}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 text-xs rounded-full border border-yellow-400/30">pending</span>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl border p-6 h-40 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Properties</p>
                    <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{analytics.totalProperties}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-600 text-xs rounded-full border border-blue-400/30">active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Booking Requests */}
            <div className="grid grid-cols-2 gap-6">
              <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Recent Booking Requests</h3>
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className={`rounded-lg p-3 border transition-all duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{booking.property}</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tenant: {booking.tenant}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Check-in: {booking.checkIn}</p>
                          <p className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{booking.price}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 text-sm rounded-full ${booking.status === 'Confirmed'
                              ? 'bg-blue-500/20 text-blue-600 border border-blue-400/30'
                              : 'bg-yellow-500/20 text-yellow-600 border border-yellow-400/30'
                            }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inbox */}
              <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Inbox</h3>
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className={`rounded-lg p-3 border transition-all duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {message.unread && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
                          <div>
                            <h4 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{message.sender}</h4>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{message.subject}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{message.time}</p>
                          </div>
                        </div>
                        <button className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                          →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeSection === 'analytics' ? (
          <div className="p-6">
            {/* Analytics Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Performance Analytics</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-600 text-sm rounded-full border border-blue-400/30">
                  Last 6 Months
                </span>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Income</p>
                    <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>NPR {analytics.totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  </div>
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>+12% from last month</div>
              </div>

              <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Occupancy Rate</p>
                    <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{analytics.occupancyRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  </div>
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>2 of 5 properties occupied</div>
              </div>

              <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Rent</p>
                    <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>NPR {analytics.averageRent.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  </div>
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Per property per month</div>
              </div>

              <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Tenants</p>
                    <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{analytics.totalTenants}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  </div>
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Currently renting</div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className={`rounded-xl border p-6 mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-bold text-lg mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Monthly Revenue Trend</h4>
              <div className="space-y-3">
                {analytics.monthlyRevenue.map((revenue, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className={`text-sm w-20 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Month {index + 1}</span>
                    <div className={`flex-1 rounded-full h-6 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(revenue / Math.max(...analytics.monthlyRevenue)) * 100}%` }}
                      >
                        <span className="text-white text-xs font-medium">NPR {revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Performance */}
            <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className={`font-bold text-lg mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Property Performance</h4>
              <div className="space-y-3">
                {properties.map((property) => (
                  <div key={property.id} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{property.name}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{property.location}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{property.price}/mo</p>
                      <span className={`px-2 py-1 text-xs rounded-full border ${property.status === 'Available'
                          ? isDarkMode ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-500/20 text-green-600 border-green-400/30'
                          : isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-500/20 text-blue-600 border-blue-400/30'
                        }`}>
                        {property.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeSection === 'properties' ? (
          <div className="p-6">
            {/* Properties Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>My Properties</h3>
              <div className="flex gap-2">
                <span className={`px-3 py-1 text-sm rounded-full border ${isDarkMode ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-500/20 text-green-600 border-green-400/30'}`}>
                  {properties.filter(p => p.status === 'Available').length} Available
                </span>
                <span className={`px-3 py-1 text-sm rounded-full border ${isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-500/20 text-blue-600 border-blue-400/30'}`}>
                  {properties.filter(p => p.status === 'Occupied').length} Occupied
                </span>
              </div>
            </div>

            {/* Properties Map */}
            <div className="mb-6">
              <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Property Locations</h4>
                <PropertyMap
                  properties={properties.map(property => ({
                    id: property._id,
                    title: property.title,
                    type: property.type,
                    price: parseInt(property.price.replace(/[^0-9]/g, '')),
                    location: property.location,
                    lat: property.lat || 27.7172 + (Math.random() - 0.5) * 0.1,
                    lng: property.lng || 85.3240 + (Math.random() - 0.5) * 0.1,
                    available: property.status === 'Available',
                    rating: property.rating || 0
                  }))}
                  height="400px"
                  showPopups={true}
                />
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-4">
                {properties.map((property) => (
                  <div key={property._id} className={`rounded-xl border p-5 hover:transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{property.title}</h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {property.location}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${property.status === 'Available'
                        ? isDarkMode ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-500/20 text-green-600 border-green-400/30'
                        : isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-500/20 text-blue-600 border-blue-400/30'
                        }`}>
                        {property.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Type:</span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{property.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price:</span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{property.price}/month</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Area:</span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{property.area || 0} sqft</span>
                      </div>

                    {/* Image Upload Section */}
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Images:</span>
                      <div className="flex items-center gap-2">
                        {propertyImages[property.id] ? (
                          <div className="w-8 h-8 rounded overflow-hidden border border-gray-300">
                            <img src={propertyImages[property.id]} alt="Property" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>📷</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handlePropertyImageUpload(e, property.id)}
                          className="hidden"
                          id={`property-images-${property.id}`}
                        />
                        <label
                          htmlFor={`property-images-${property.id}`}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg cursor-pointer transition-colors"
                        >
                          📷 Upload
                        </label>
                      </div>
                    </div>
                  </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedProperty(property);
                          setShowDetailsModal(true);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-blue-400/30">
                        Details
                      </button>
                      <button
                        onClick={() => {
                          setEditingProperty(property);
                          setPropertyName(property.title);
                          setPropertyLocation(property.location);
                          setPropertyPrice(property.price.replace('NPR ', ''));
                          setPropertyType(property.type);
                          setPropertyStatus(property.status);
                          setShowEditForm(true);
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 border border-gray-300 hover:border-gray-400">
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProperty(property._id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 border border-red-200 hover:border-red-300">
                        Delete
                      </button>
                    </div>
                </div>
              ))}
            </div>

            {/* Add New Property Button */}
            <div className="mt-6 text-center mb-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-blue-400/30"
              >
                + Add New Property
              </button>
            </div>

            {/* Add New Property Form */}
            {showAddForm && (
              <div className={`rounded-xl border p-6 mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Add New Property</h3>
                <form onSubmit={handleAddProperty} className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Property Name"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    className={`px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400 hover:bg-gray-50'
                    }`}
                    required
                  />
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Location (Click map to select)"
                      value={propertyLocation}
                      onChange={(e) => setPropertyLocation(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pr-24 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                          : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400 hover:bg-gray-50'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      📍 Map
                    </button>
                  </div>
                  <input
                    type="number"
                    placeholder="Price (NPR)"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(e.target.value)}
                    className={`px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400 hover:bg-gray-50'
                    }`}
                    required
                  />
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className={`px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    required
                  >
                    <option value="" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>Select Type</option>
                    <option value="Studio" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>Studio</option>
                    <option value="1 Bedroom" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>1 Bedroom</option>
                    <option value="2 Bedroom" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>2 Bedroom</option>
                    <option value="3 Bedroom" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>3 Bedroom</option>
                  </select>

                  {/* Multiple Images Upload Section */}
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Property Images</label>

                    {/* Image Upload Input */}
                    <div className="mb-3">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultipleImageUpload}
                        className="hidden"
                        id="property-images-upload"
                      />
                      <label
                        htmlFor="property-images-upload"
                        className={`w-full px-4 py-3 rounded-xl cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        📷 Upload Multiple Images
                      </label>
                    </div>

                    {/* Images Preview */}
                    {newPropertyImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {newPropertyImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="w-full h-20 rounded-lg overflow-hidden border border-gray-200">
                              <img src={image} alt={`Property image ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNewPropertyImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {newPropertyImages.length === 0 && (
                      <div className={`text-center py-4 border-2 border-dashed rounded-lg ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        <div className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>
                          <div className={`w-8 h-8 rounded mx-auto mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                          <p className="text-sm">No images uploaded yet</p>
                          <p className="text-xs">Upload multiple room images</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-blue-400/30"
                    >
                      Add Property
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 border ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Location Picker Modal */}
            {showMapPicker && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className={`rounded-3xl p-6 w-full max-w-4xl border shadow-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Select Property Location</h3>
                    <button
                      onClick={() => setShowMapPicker(false)}
                      className={`rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-gray-600 bg-gray-700 hover:bg-gray-600' 
                          : 'text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Click on the map to select your property location</p>
                    {selectedCoordinates && (
                      <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                          <strong>Selected:</strong> {selectedCoordinates.lat.toFixed(4)}, {selectedCoordinates.lng.toFixed(4)}
                        </p>
                      </div>
                    )}
                  </div>

                  <PropertyMap
                    properties={selectedCoordinates ? [{
                      id: 0,
                      title: 'Selected Location',
                      type: 'Property',
                      price: 0,
                      location: `${selectedCoordinates.lat.toFixed(4)}, ${selectedCoordinates.lng.toFixed(4)}`,
                      lat: selectedCoordinates.lat,
                      lng: selectedCoordinates.lng,
                      available: true,
                      rating: 0
                    }] : []}
                    height="400px"
                    center={[27.7172, 85.3240]}
                    zoom={12}
                    onPropertyClick={(property) => {
                      // For location picker, we use the click coordinates
                      if (property.lat && property.lng) {
                        handleMapClick(property.lat, property.lng);
                      }
                    }}
                    showPopups={false}
                  />

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setShowMapPicker(false)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      Cancel
                    </button>
                    {selectedCoordinates && (
                      <button
                        onClick={() => {
                          handleMapClick(selectedCoordinates.lat, selectedCoordinates.lng);
                        }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
                      >
                        Confirm Location
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Edit Property Modal */}
            {showEditForm && editingProperty && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-6">Edit Property</h3>
                  <form className="space-y-4" onSubmit={async (e: React.FormEvent) => {
                    e.preventDefault();
                    try {
                      const token = localStorage.getItem('token');
                      const typeMap: { [key: string]: string } = {
                        'Studio': 'studio',
                        '1 Bedroom': 'room',
                        '2 Bedroom': 'apartment',
                        '3 Bedroom': 'house'
                      };

                      const response = await fetch(`http://localhost:5000/api/properties/${editingProperty._id}`, {
                        method: 'PUT',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          title: propertyName,
                          location: propertyLocation,
                          price: `NPR ${propertyPrice}`,
                          type: typeMap[propertyType] || propertyType.toLowerCase(),
                          status: propertyStatus
                        }),
                      });

                      if (response.ok) {
                        alert('Property updated successfully');
                        setShowEditForm(false);
                        setEditingProperty(null);
                        fetchDashboardData();
                      } else {
                        const errorData = await response.json();
                        alert(`Failed to update property: ${errorData.message}`);
                      }
                    } catch (error) {
                      console.error('Error updating property:', error);
                      alert('An error occurred while updating the property');
                    }
                  }}>
                    <input
                      type="text"
                      placeholder="Property Name"
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={propertyLocation}
                      onChange={(e) => setPropertyLocation(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price (NPR)"
                      value={propertyPrice}
                      onChange={(e) => setPropertyPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                      required
                    />
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                      required
                    >
                      <option value="" className="bg-gray-800">Select Type</option>
                      <option value="Studio" className="bg-gray-800">Studio</option>
                      <option value="1 Bedroom" className="bg-gray-800">1 Bedroom</option>
                      <option value="2 Bedroom" className="bg-gray-800">2 Bedroom</option>
                      <option value="3 Bedroom" className="bg-gray-800">3 Bedroom</option>
                    </select>
                    <select
                      value={propertyStatus}
                      onChange={(e) => setPropertyStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                      required
                    >
                      <option value="" className="bg-gray-800">Select Status</option>
                      <option value="Available" className="bg-gray-800">Available</option>
                      <option value="Occupied" className="bg-gray-800">Occupied</option>
                    </select>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30"
                      >
                        Update Property
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditForm(false);
                          setEditingProperty(null);
                          // Reset form
                          setPropertyName('');
                          setPropertyLocation('');
                          setPropertyPrice('');
                          setPropertyType('');
                          setPropertyStatus('');
                        }}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all duration-300 border border-white/20 hover:border-white/30"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Property Details Modal */}
            {showDetailsModal && selectedProperty && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-6">Property Details</h3>
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                      <h4 className="text-lg font-semibold text-white mb-3">{selectedProperty.title || selectedProperty.name}</h4>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-200 text-sm">
                            Location:
                          </span>
                          <span className="text-white text-sm font-medium">{selectedProperty.location}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-emerald-200 text-sm">
                            Price:
                          </span>
                          <span className="text-white text-sm font-bold">{selectedProperty.price}/month</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-emerald-200 text-sm">
                            Type:
                          </span>
                          <span className="text-white text-sm font-medium">{selectedProperty.type}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-emerald-200 text-sm">
                            Status:
                          </span>
                          <span className={`text-sm font-medium px-3 py-1 rounded-full ${selectedProperty.status === 'Available'
                            ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                            }`}>
                            {selectedProperty.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-emerald-200 text-sm">
                            Area:
                          </span>
                          <span className="text-white text-sm font-medium">{selectedProperty.area || 0} sqft</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-emerald-200 text-sm">
                            Property ID:
                          </span>
                          <span className="text-white text-sm font-medium">#{selectedProperty._id || selectedProperty.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h5 className="text-white font-medium mb-2">Quick Actions</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowDetailsModal(false);
                            setEditingProperty(selectedProperty);
                            setPropertyName(selectedProperty.name);
                            setPropertyLocation(selectedProperty.location);
                            setPropertyPrice(selectedProperty.price.replace('NPR ', ''));
                            setPropertyType(selectedProperty.type);
                            setPropertyStatus(selectedProperty.status);
                            setShowEditForm(true);
                          }}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-white/20 hover:border-white/30"
                        >
                          Edit Property
                        </button>
                        <button
                          onClick={() => {
                            alert(`Contact information for ${selectedProperty.name} would be displayed here`);
                          }}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30"
                        >
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedProperty(null);
                      }}
                      className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all duration-300 border border-white/20 hover:border-white/30"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeSection === 'bookings' ? (
          <Bookings />
        ) : activeSection === 'payments' ? (
          <PaymentHistory />
        ) : activeSection === 'messages' ? (
          <Messages />
        ) : activeSection === 'settings' ? (
          <Settings />
        ) : (
          <div className="p-6">
            <div className="text-center py-16">
              <div className="text-6xl mb-4 text-emerald-400"></div>
              <h3 className="text-2xl font-bold text-white mb-2">Coming Soon</h3>
              <p className="text-emerald-100">The {activeSection} section is under development</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordDashboard;
