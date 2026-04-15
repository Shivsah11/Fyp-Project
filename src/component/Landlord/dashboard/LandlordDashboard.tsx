import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Bookings from './Bookings';
import Messages from './Messages';
import Settings from './Setting';
import PaymentHistory from '../PaymentHistory';
import PropertyMap from '../../Shared/PropertyMap';
import { useDarkMode } from '../../../context/DarkModeContext';
import { NotificationProvider } from '../../../context/NotificationContext';
import NotificationDropdown from '../../Shared/NotificationDropdown';

const LandlordDashboard = () => {
  const { isDarkMode } = useDarkMode();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [analyticsRange, setAnalyticsRange] = useState('6months');
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);

  const rangeOptions = [
    { id: '30days', label: 'Last 30 Days' },
    { id: '3months', label: 'Last 3 Months' },
    { id: '6months', label: 'Last 6 Months' },
    { id: '1year', label: 'Last Year' }
  ];

  const handleRangeChange = (rangeId: string) => {
    setAnalyticsRange(rangeId);
    setShowRangeDropdown(false);

    // Simulate data update logic for demo purposes
    const multiplier = rangeId === '30days' ? 0.2 : rangeId === '3months' ? 0.5 : rangeId === '1year' ? 1.8 : 1.0;

    setAnalytics(prev => ({
      ...prev,
      totalIncome: Math.floor(prev.totalIncome * (0.9 + Math.random() * 0.2) * multiplier),
      totalTenants: Math.floor(prev.totalTenants * multiplier),
      monthlyRevenue: prev.monthlyRevenue.map(rev => Math.floor(rev * (0.8 + Math.random() * 0.4)))
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showRangeDropdown && target && !target.closest('.analytics-range-selector')) {
        setShowRangeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRangeDropdown]);
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
  const [newPropertyImages, setNewPropertyImages] = useState<string[]>([]);
  const [editingPropertyImages, setEditingPropertyImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [propertyPage, setPropertyPage] = useState(1);
  const propertiesPerPage = 4;
  const [analytics, setAnalytics] = useState({
    totalIncome: 0,
    totalProperties: 0,
    occupiedProperties: 0,
    pendingBookings: 0,
    monthlyRevenue: new Array(12).fill(0),
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
            monthlyRevenue: apiAnalytics.monthlyRevenue || new Array(12).fill(0),
            occupancyRate: apiAnalytics.occupancyRate || 0,
            averageRent: apiAnalytics.averageRent || 0
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
        images: newPropertyImages,
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



  const handlePropertyImageUpload = (e: React.ChangeEvent<HTMLInputElement>, propertyId: string) => {
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

      Promise.all(imageReaders).then(async (images) => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              images: images // For simplicity we replace, but realistically we might append
            }),
          });

          if (response.ok) {
            alert('Property images updated successfully!');
            fetchDashboardData();
          } else {
            alert('Failed to update images');
          }
        } catch (error) {
          console.error('Error updating property images:', error);
          alert('Error updating images');
        }
      });
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen w-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`text-xl font-semibold animate-pulse ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading Landlord Dashboard...</div>
      </div>
    );
  }

  return (
    <NotificationProvider userType="landlord">
      <div className={`h-screen w-screen flex flex-col relative overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

        {/* Animated background elements - fixed to viewport */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className={`absolute top-20 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse ${isDarkMode ? 'bg-blue-900/10' : 'bg-blue-100/30'}`}></div>
          <div className={`absolute bottom-20 right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000 ${isDarkMode ? 'bg-indigo-900/10' : 'bg-indigo-100/30'}`}></div>
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000 ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-100/30'}`}></div>
        </div>

        {/* Top Navbar - Fixed/Sticky at its own place */}
        <nav className={`sticky top-0 z-50 w-full backdrop-blur-xl border-b ${isDarkMode ? 'bg-gray-900/60 border-gray-700/50' : 'bg-white/70 border-gray-200/50'} px-6 py-4 flex items-center justify-between shadow-lg shadow-black/5`}>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-black tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
              SUITE DREAMS
            </h1>
            <span className={`text-xs px-2 py-1 rounded-full font-bold ml-2 ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>Landlord</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 overflow-x-auto mx-4 no-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeSection === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-[1.05] border border-blue-400/30'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-100 hover:bg-gray-800 border border-transparent'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`text-right hidden md:block`}>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{userName}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white/20">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Notification Button Group - Right Side */}
            <div className="flex items-center gap-2">
              <div className={`w-px h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <NotificationDropdown />
              <div className={`w-px h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            </div>

            <Link
              to="/"
              className={`p-2 rounded-xl transition-all duration-300 ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-red-400' : 'text-gray-500 hover:bg-gray-100 hover:text-red-500'
                }`}
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <div className={`flex-1 relative z-10 overflow-x-hidden overflow-y-auto ${isDarkMode ? 'bg-transparent' : 'bg-transparent'}`}>
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">


            {/* Content based on active section */}
            {activeSection === 'dashboard' ? (
              <div className="px-6 pt-6 mt-4">

                {/* Quick Actions / Manage section requested by user */}
                {/* Sleek Dashboard Header Section - Scaled up */}
                <div className="relative mb-12 pb-8 border-b border-gray-200/50 dark:border-gray-700/50">
                  {/* Centered Content Section */}
                  <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                      <span className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Live Overview</span>
                    </div>
                    <h2 className={`text-4xl md:text-5xl font-black tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      Dashboard
                    </h2>
                    <p className={`text-base md:text-lg font-medium mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Welcome back, <span className="text-blue-600 dark:text-blue-400 font-extrabold">{userName}</span>! Here's what's happening with your properties today.
                    </p>

                    {/* Action Buttons - Centered */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <button
                        onClick={() => document.getElementById('analytics-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-7 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-sm border border-gray-200 dark:border-gray-700 group"
                      >
                        <svg className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        Analytics
                      </button>
                      <button
                        onClick={() => { setActiveSection('properties'); setShowAddForm(true); }}
                        className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-7 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl shadow-blue-500/25 transform hover:-translate-y-0.5"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Add Property
                      </button>
                    </div>
                  </div>

                  {/* Date Section - Absolute positioned in the top-right corner */}
                  <div className="absolute top-1 right-0 flex flex-col items-end">
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-1`}>
                      {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                    </p>
                    <p className={`text-2xl font-black ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} tracking-tight`}>
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Analytics/Buttons will stay in the left-hand column above the date */}

                {/* Square Info Cards - Forced into a single row using Flexbox */}
                <div className="flex flex-row gap-4 mb-8 w-full">
                  <div className={`flex-1 rounded-xl border p-5 h-36 transition-all duration-300 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Income</p>
                        <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>NPR {analytics.totalIncome.toLocaleString()}</p>
                      </div>
                      <div className="bg-blue-500/10 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className={`flex-1 rounded-xl border p-5 h-36 transition-all duration-300 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Tenants</p>
                        <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{analytics.totalTenants}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-400/20">Occupied</span>
                      </div>
                    </div>
                  </div>

                  <div className={`flex-1 rounded-xl border p-5 h-36 transition-all duration-300 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending Requests</p>
                        <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{analytics.pendingBookings}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] font-bold rounded-full border border-yellow-400/20">Pending</span>
                      </div>
                    </div>
                  </div>

                  <div className={`flex-1 rounded-xl border p-5 h-36 transition-all duration-300 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Properties</p>
                        <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{analytics.totalProperties}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-400/20">Active</span>
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

                {/* Detailed Analytics Section */}
                <div id="analytics-section" className="mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
                  {/* Analytics Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Performance Analytics</h3>
                    <div className="relative analytics-range-selector">
                      <button
                        onClick={() => setShowRangeDropdown(!showRangeDropdown)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 ${isDarkMode
                          ? 'bg-blue-500/10 text-blue-400 border-blue-400/30 hover:bg-blue-500/20 shadow-lg shadow-blue-500/10'
                          : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 shadow-md transform hover:scale-[1.02]'
                          }`}
                      >
                        <span className="text-sm font-black italic uppercase tracking-wider">
                          {rangeOptions.find(o => o.id === analyticsRange)?.label}
                        </span>
                        <svg className={`w-4 h-4 transition-transform duration-300 ${showRangeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Range Dropdown Menu */}
                      {showRangeDropdown && (
                        <div className={`absolute right-0 mt-3 w-48 rounded-2xl border backdrop-blur-xl shadow-2xl z-50 overflow-hidden transform origin-top transition-all duration-300 animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-gray-900/90 border-gray-700/50' : 'bg-white/90 border-gray-100'
                          }`}>
                          <div className="p-2 space-y-1">
                            {rangeOptions.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleRangeChange(option.id)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-black italic transition-all duration-200 ${analyticsRange === option.id
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                                  : isDarkMode
                                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Metrics - Forced into a single row using Flexbox */}
                  <div className="flex flex-row gap-4 mb-6 w-full">
                    <div className={`flex-1 rounded-xl border p-6 transition-all duration-300 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Income</p>
                          <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>NPR {analytics.totalIncome.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-800/50">
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>+12% from last month</div>
                    </div>

                    <div className={`flex-1 rounded-xl border p-6 transition-all duration-300 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Occupancy Rate</p>
                          <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{analytics.occupancyRate}%</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-800/50">
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>2 of 5 properties occupied</div>
                    </div>

                    <div className={`flex-1 rounded-xl border p-6 transition-all duration-300 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Rent</p>
                          <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>NPR {analytics.averageRent.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-200 dark:border-purple-800/50">
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Per property per month</div>
                    </div>

                    <div className={`flex-1 rounded-xl border p-6 transition-all duration-300 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Tenants</p>
                          <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{analytics.totalTenants}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-200 dark:border-orange-800/50">
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Currently renting</div>
                    </div>
                  </div>

                  {/* Charts and Performance Row */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Revenue Chart - Equal width card */}
                    <div className="rounded-xl border p-6 transition-all duration-300 hover:shadow-md h-full flex flex-col overflow-hidden bg-white/90 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
                      <h4 className={`font-bold text-lg mb-8 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Monthly Revenue Trend</h4>
                      <div className="grid grid-cols-6 gap-x-3 gap-y-6">
                        {analytics.monthlyRevenue.map((revenue, index) => {
                          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          const now = new Date();
                          const monthIndex = (now.getMonth() - (11 - index) + 12) % 12;
                          const monthLabel = monthNames[monthIndex];

                          return (
                            <div key={index} className="flex flex-col gap-3 group">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-400 group-hover:text-blue-400' : 'text-gray-500 group-hover:text-blue-600'} transition-colors`}>{monthLabel}</span>
                                <span className={`text-[10px] font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>NPR {revenue >= 1000 ? `${(revenue / 1000).toFixed(1)}k` : revenue}</span>
                              </div>
                              <div className={`w-full rounded-2xl h-14 overflow-hidden border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-200'} relative`}>
                                <div
                                  className="bg-gradient-to-t from-blue-600 to-indigo-500 w-full rounded-2xl absolute bottom-0 transition-all duration-1000 ease-out shadow-lg"
                                  style={{ height: `${Math.max((revenue / (Math.max(...analytics.monthlyRevenue) || 1)) * 100, 4)}%` }}
                                >
                                  {revenue > 0 && (
                                    <div className="absolute top-2 left-0 w-full text-center">
                                      <span className="text-white text-[9px] font-black tracking-tighter opacity-80">{revenue >= 1000 ? `${(revenue / 1000).toFixed(0)}k` : revenue}</span>
                                    </div>
                                  )}
                                </div>
                                {revenue === 0 && <span className={`absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase tracking-tighter ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} rotate-[-45deg]`}>Zero</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Property Performance */}
                    <div className={`rounded-xl border p-6 transition-all duration-300 hover:shadow-md ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/90 border-gray-200'}`}>
                      <h4 className={`font-bold text-lg mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Property Performance</h4>
                      <div className="space-y-3">
                        {properties.slice((propertyPage - 1) * propertiesPerPage, propertyPage * propertiesPerPage).map((property) => (
                          <div key={property.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700' : 'bg-gray-50/50 border-gray-200/50 hover:bg-gray-100'}`}>
                            <div>
                              <p className={`font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{property.name}</p>
                              <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{property.location}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{property.price}<span className="text-sm font-normal opacity-70">/mo</span></p>
                              <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full border ${property.status === 'Available'
                                ? isDarkMode ? 'bg-green-900/30 text-green-400 border-green-700/50' : 'bg-green-500/10 text-green-600 border-green-400/30'
                                : isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-700/50' : 'bg-blue-500/10 text-blue-600 border-blue-400/30'
                                }`}>
                                {property.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination Controls - Always show if at least 1 property exists to confirm feature is working */}
                      {properties.length > 0 && (
                        <div className="flex items-center justify-center gap-2 mt-8 py-2 border-t border-gray-100 dark:border-gray-700/50">
                          <button
                            onClick={() => setPropertyPage(prev => Math.max(prev - 1, 1))}
                            disabled={propertyPage === 1}
                            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} disabled:opacity-30 disabled:cursor-not-allowed shadow-sm`}
                            title="Previous Page"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                          </button>

                          <div className="flex items-center gap-2 mx-2">
                            {[...Array(Math.ceil(properties.length / propertiesPerPage))].map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setPropertyPage(i + 1)}
                                className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 ${propertyPage === i + 1
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20'
                                  : isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'}`}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => setPropertyPage(prev => Math.min(prev + 1, Math.ceil(properties.length / propertiesPerPage)))}
                            disabled={propertyPage === Math.ceil(properties.length / propertiesPerPage)}
                            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} disabled:opacity-30 disabled:cursor-not-allowed shadow-sm`}
                            title="Next Page"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                          </button>
                        </div>
                      )}
                    </div>
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
                          <div className="flex items-center gap-2">
                            {property.images && property.images.length > 0 ? (
                              <div className="flex -space-x-2">
                                {property.images.slice(0, 3).map((imgUrl: string, idx: number) => (
                                  <div key={idx} className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
                                    <img src={imgUrl} alt="Property" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                                {property.images.length > 3 && (
                                  <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-400">
                                    +{property.images.length - 3}
                                  </div>
                                )}
                              </div>
                            ) : property.image ? (
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-300">
                                <img src={property.image} alt="Property" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>📷</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handlePropertyImageUpload(e, property._id)}
                              className="hidden"
                              id={`property-images-${property._id}`}
                            />
                            <label
                              htmlFor={`property-images-${property._id}`}
                              className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-[10px] rounded-lg cursor-pointer transition-colors font-bold uppercase"
                            >
                              📷 Update
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
                            setEditingPropertyImages(property.images || (property.image ? [property.image] : []));
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

                {/* Add New Property Form - Always visible for testing */}
                {true && (
                  <div className={`rounded-xl border p-6 mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Add New Property</h3>
                    <form onSubmit={handleAddProperty} className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Property Name"
                        value={propertyName}
                        onChange={(e) => setPropertyName(e.target.value)}
                        className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 hover:bg-gray-100'
                          }`}
                        required
                      />
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Location (Click map to select)"
                          value={propertyLocation}
                          onChange={(e) => setPropertyLocation(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pr-24 ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600'
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 hover:bg-gray-100'
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
                        className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-600'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 hover:bg-gray-100'
                          }`}
                        required
                      />
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className={`px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                          : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
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
                            className={`w-full px-4 py-3 border rounded-xl cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
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

                        {/* Always show for testing */}
                        <div className={`text-center py-8 border-4 border-dashed rounded-xl ${isDarkMode ? 'border-blue-400 bg-gray-800/70' : 'border-blue-500 bg-blue-100'}`}>
                          <div className={isDarkMode ? 'text-blue-300' : 'text-blue-800'}>
                            <div className={`w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-blue-200'}`}>
                              <span className="text-2xl">📷</span>
                            </div>
                            <p className="text-sm font-medium mb-1">No images uploaded yet</p>
                            <p className="text-xs">Upload multiple room images using the button above</p>
                            <p className="text-xs mt-2">Debug: Images count = {newPropertyImages.length}</p>
                          </div>
                        </div>
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
                          className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 border ${isDarkMode
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
                          className={`rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors ${isDarkMode
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
                        onMapClick={(lat, lng) => {
                          setSelectedCoordinates({ lat, lng });
                        }}
                        showPopups={false}
                      />

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => setShowMapPicker(false)}
                          className={`flex-1 py-3 rounded-xl font-medium transition-colors ${isDarkMode
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
                              status: propertyStatus,
                              images: editingPropertyImages,
                              image: editingPropertyImages.length > 0 ? editingPropertyImages[0] : ''
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
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                          <option value="Maintenance" className="bg-gray-800">Maintenance</option>
                        </select>

                        {/* Edit Property Images Section */}
                        <div className="space-y-3">
                          <label className="block text-xs font-black uppercase tracking-widest text-emerald-200">Property Images</label>
                          <div className="grid grid-cols-4 gap-2">
                            {editingPropertyImages.map((img, idx) => (
                              <div key={idx} className="relative group h-16 rounded-lg overflow-hidden border border-white/20">
                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setEditingPropertyImages(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute top-0.5 right-0.5 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <label className="h-16 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                              <span className="text-xl text-emerald-400">+</span>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files) {
                                    Array.from(files).forEach(file => {
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        setEditingPropertyImages(prev => [...prev, reader.result as string]);
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
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
      </div>
    </NotificationProvider>
  );
};

export default LandlordDashboard;

