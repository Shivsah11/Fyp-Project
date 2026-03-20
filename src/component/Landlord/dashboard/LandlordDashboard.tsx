import { useState } from 'react';
import { Link } from 'react-router-dom';
import Bookings from './Bookings';
import Messages from './Messages';
import Settings from './Setting';

const LandlordDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [propertyName, setPropertyName] = useState('');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [propertyPrice, setPropertyPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [propertyStatus, setPropertyStatus] = useState('');
  const [properties, setProperties] = useState([
    { id: 1, name: '2 BHK Apartment', location: 'Kathmandu, Nepal', price: 'NPR 30000', type: '2 Bedroom', status: 'Available', tenants: 0 },
    { id: 2, name: 'Studio Room', location: 'Pokhara, Nepal', price: 'NPR 15000', type: 'Studio', status: 'Occupied', tenants: 1 },
    { id: 3, name: '3 BHK House', location: 'Lalitpur, Nepal', price: 'NPR 45000', type: '3 Bedroom', status: 'Available', tenants: 0 },
    { id: 4, name: '1 BHK Apartment', location: 'Bhaktapur, Nepal', price: 'NPR 20000', type: '1 Bedroom', status: 'Occupied', tenants: 1 },
    { id: 5, name: 'Penthouse', location: 'Kathmandu, Nepal', price: 'NPR 60000', type: '3 Bedroom', status: 'Available', tenants: 0 },
  ]);

  const [analytics, setAnalytics] = useState({
    totalIncome: 45000,
    totalProperties: 5,
    occupiedProperties: 2,
    pendingBookings: 2,
    monthlyRevenue: [30000, 35000, 28000, 42000, 38000, 45000],
    occupancyRate: 40,
    averageRent: 34000,
    totalTenants: 3
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'properties', label: 'Properties' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'messages', label: 'Messages' },
    { id: 'settings', label: 'Settings' },
  ];

  const recentBookings = [
    { id: 1, property: '2 BHK Apartment', tenant: 'John Doe', checkIn: '23 Jun 2025', status: 'Pending', price: 'NPR 30000' },
    { id: 2, property: 'Studio Room', tenant: 'Jane Smith', checkIn: '25 Jun 2025', status: 'Confirmed', price: 'NPR 15000' },
  ];

  const messages = [
    { id: 1, sender: 'John Doe', subject: 'Maintenance Request', time: '2 hours ago', unread: true },
    { id: 2, sender: 'Jane Smith', subject: 'Payment Confirmation', time: '5 hours ago', unread: false },
  ];

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const newProperty = {
      id: properties.length + 1,
      name: propertyName,
      location: propertyLocation,
      price: `NPR ${propertyPrice}`,
      type: propertyType,
      status: 'Available',
      tenants: 0
    };
    setProperties([...properties, newProperty]);
    alert(`Property "${propertyName}" added successfully!`);
    setPropertyName('');
    setPropertyLocation('');
    setPropertyPrice('');
    setPropertyType('');
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex relative overflow-hidden">

      {/* Animated background elements */}
      <div className="absolute inset-0 fixed">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
      <div className="relative z-10 w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 min-h-screen">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/20">
          <h1 className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg">
            SUITE DREAMS
          </h1>
          <p className="text-emerald-100 text-sm mt-1">Landlord Portal</p>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transform scale-[1.02] border border-emerald-400/30'
                      : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white border border-emerald-600/30 hover:border-emerald-500/50'
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
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                A
              </div>
              <div>
                <p className="text-white font-semibold">Alex</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <Link
            to="/"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30 flex items-center justify-center gap-2"
          >
            <span>Logout</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-1 tracking-wide drop-shadow-lg">
                {activeSection === 'dashboard' ? 'Welcome Back, Alex' : 
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
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30"
                >
                  View Analytics
                </button>
                <button 
                  onClick={() => setActiveSection('properties')}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30"
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
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 h-40">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-emerald-100 text-sm font-semibold">Total Income</p>
                    <p className="text-3xl font-bold text-white mt-2">NPR 45,000</p>
                  </div>
                  <div className="bg-emerald-500/20 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 h-40">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-emerald-100 text-sm font-semibold">Active Tenants</p>
                    <p className="text-3xl font-bold text-white mt-2">3</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-400/30">occupied</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 h-40">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-emerald-100 text-sm font-semibold">Pending Requests</p>
                    <p className="text-3xl font-bold text-white mt-2">2</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-400/30">pending</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 h-40">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <p className="text-emerald-100 text-sm font-semibold">Total Properties</p>
                    <p className="text-3xl font-bold text-white mt-2">5</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-400/30">active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Booking Requests */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Recent Booking Requests</h3>
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold">{booking.property}</h4>
                          <p className="text-emerald-200 text-sm">Tenant: {booking.tenant}</p>
                          <p className="text-emerald-200 text-sm">Check-in: {booking.checkIn}</p>
                          <p className="text-white font-bold">{booking.price}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            booking.status === 'Confirmed' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
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
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Inbox</h3>
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {message.unread && (
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          )}
                          <div>
                            <h4 className="text-white font-semibold">{message.sender}</h4>
                            <p className="text-emerald-200 text-sm">{message.subject}</p>
                            <p className="text-emerald-200/60 text-xs">{message.time}</p>
                          </div>
                        </div>
                        <button className="text-emerald-300 hover:text-emerald-200">
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
              <h3 className="text-lg font-bold text-white">Performance Analytics</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full border border-emerald-400/30">
                  Last 6 Months
                </span>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-emerald-100 text-sm font-semibold">Total Income</p>
                    <p className="text-3xl font-bold text-white mt-2">NPR {analytics.totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  </div>
                </div>
                <div className="text-emerald-300 text-sm">+12% from last month</div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-emerald-100 text-sm font-semibold">Occupancy Rate</p>
                    <p className="text-3xl font-bold text-white mt-2">{analytics.occupancyRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  </div>
                </div>
                <div className="text-blue-300 text-sm">2 of 5 properties occupied</div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-emerald-100 text-sm font-semibold">Average Rent</p>
                    <p className="text-3xl font-bold text-white mt-2">NPR {analytics.averageRent.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  </div>
                </div>
                <div className="text-purple-300 text-sm">Per property per month</div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-emerald-100 text-sm font-semibold">Active Tenants</p>
                    <p className="text-3xl font-bold text-white mt-2">{analytics.totalTenants}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  </div>
                </div>
                <div className="text-orange-300 text-sm">Currently renting</div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 mb-6">
              <h4 className="text-white font-bold text-lg mb-4">Monthly Revenue Trend</h4>
              <div className="space-y-3">
                {analytics.monthlyRevenue.map((revenue, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-emerald-200 text-sm w-20">Month {index + 1}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-6 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full flex items-center justify-end pr-2"
                        style={{width: `${(revenue / Math.max(...analytics.monthlyRevenue)) * 100}%`}}
                      >
                        <span className="text-white text-xs font-medium">NPR {revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Performance */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <h4 className="text-white font-bold text-lg mb-4">Property Performance</h4>
              <div className="space-y-3">
                {properties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{property.name}</p>
                      <p className="text-emerald-200 text-sm">{property.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{property.price}/mo</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        property.status === 'Available' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
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
              <h3 className="text-lg font-bold text-white">My Properties</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full border border-emerald-400/30">
                  {properties.filter(p => p.status === 'Available').length} Available
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-400/30">
                  {properties.filter(p => p.status === 'Occupied').length} Occupied
                </span>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-4">
              {properties.map((property) => (
                <div key={property.id} className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-bold text-lg">{property.name}</h4>
                      <p className="text-emerald-200 text-sm">
                        {property.location}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      property.status === 'Available' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200 text-sm">Type:</span>
                      <span className="text-white text-sm font-medium">{property.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200 text-sm">Price:</span>
                      <span className="text-white text-sm font-bold">{property.price}/month</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-200 text-sm">Tenants:</span>
                      <span className="text-white text-sm font-medium">{property.tenants}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedProperty(property);
                        setShowDetailsModal(true);
                      }}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30">
                      View Details
                    </button>
                    <button 
                      onClick={() => {
                        setEditingProperty(property);
                        setPropertyName(property.name);
                        setPropertyLocation(property.location);
                        setPropertyPrice(property.price.replace('NPR ', ''));
                        setPropertyType(property.type);
                        setPropertyStatus(property.status);
                        setShowEditForm(true);
                      }}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-white/20 hover:border-white/30">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Property Button */}
            <div className="mt-6 text-center mb-6">
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30"
              >
                + Add New Property
              </button>
            </div>

            {/* Add New Property Form */}
            {showAddForm && (
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Add New Property</h3>
                <form onSubmit={handleAddProperty} className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Property Name"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={propertyLocation}
                    onChange={(e) => setPropertyLocation(e.target.value)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price (NPR)"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(e.target.value)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    required
                  />
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    required
                  >
                    <option value="" className="bg-gray-800">Select Type</option>
                    <option value="Studio" className="bg-gray-800">Studio</option>
                    <option value="1 Bedroom" className="bg-gray-800">1 Bedroom</option>
                    <option value="2 Bedroom" className="bg-gray-800">2 Bedroom</option>
                    <option value="3 Bedroom" className="bg-gray-800">3 Bedroom</option>
                  </select>
                  <div className="col-span-2 flex gap-3">
                    <button 
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-emerald-400/30"
                    >
                      Add Property
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all duration-300 border border-white/20 hover:border-white/30"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Property Modal */}
            {showEditForm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-6">Edit Property</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const newTenants = propertyStatus === 'Occupied' ? 1 : 0;
                    setProperties(properties.map(p => 
                      p.id === editingProperty.id 
                        ? { ...p, name: propertyName, location: propertyLocation, price: `NPR ${propertyPrice}`, type: propertyType, status: propertyStatus, tenants: newTenants }
                        : p
                    ));
                    setShowEditForm(false);
                    setEditingProperty(null);
                    // Reset form
                    setPropertyName('');
                    setPropertyLocation('');
                    setPropertyPrice('');
                    setPropertyType('');
                    setPropertyStatus('');
                  }} className="space-y-4">
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
                      <h4 className="text-lg font-semibold text-white mb-3">{selectedProperty.name}</h4>
                      
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
                          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                            selectedProperty.status === 'Available' 
                              ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                          }`}>
                            {selectedProperty.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-200 text-sm">
                            Current Tenants:
                          </span>
                          <span className="text-white text-sm font-medium">{selectedProperty.tenants}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-200 text-sm">
                            Property ID:
                          </span>
                          <span className="text-white text-sm font-medium">#{selectedProperty.id}</span>
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
