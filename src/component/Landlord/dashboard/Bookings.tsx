import React, { useState } from 'react';

interface Booking {
  id: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  propertyName: string;
  propertyType: string;
  location: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  price: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  image: string;
  amenities: string[];
  requestDate: string;
  specialRequests?: string;
}

const Bookings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'>('pending');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Sample booking data for landlord
  const bookings: Booking[] = [
    {
      id: 'BK001',
      tenantName: 'John Doe',
      tenantEmail: 'john.doe@example.com',
      tenantPhone: '+977-9841234567',
      propertyName: 'Sunset Apartment',
      propertyType: '2 BHK',
      location: 'Thamel, Kathmandu',
      checkIn: '2024-01-15',
      checkOut: '2024-06-15',
      status: 'pending',
      price: 25000,
      paymentStatus: 'pending',
      image: '/api/placeholder/300/200',
      amenities: ['WiFi', 'Parking', 'Gym', 'Security'],
      requestDate: '2024-01-10',
      specialRequests: 'Need early check-in if possible'
    },
    {
      id: 'BK002',
      tenantName: 'Sarah Miller',
      tenantEmail: 'sarah.miller@example.com',
      tenantPhone: '+977-9849876543',
      propertyName: 'Mountain View Studio',
      propertyType: 'Studio',
      location: 'Patan, Kathmandu',
      checkIn: '2024-02-01',
      checkOut: '2024-08-01',
      status: 'confirmed',
      price: 15000,
      paymentStatus: 'paid',
      image: '/api/placeholder/300/200',
      amenities: ['WiFi', 'Balcony', 'Security'],
      requestDate: '2024-01-15'
    },
    {
      id: 'BK003',
      tenantName: 'Mike Johnson',
      tenantEmail: 'mike.j@example.com',
      tenantPhone: '+977-9845678901',
      propertyName: 'City Center Flat',
      propertyType: '1 BHK',
      location: 'New Baneshwor, Kathmandu',
      checkIn: '2023-06-01',
      checkOut: '2023-12-01',
      status: 'completed',
      price: 20000,
      paymentStatus: 'paid',
      image: '/api/placeholder/300/200',
      amenities: ['WiFi', 'Parking', 'Security'],
      requestDate: '2023-05-20'
    }
  ];

  const filteredBookings = bookings.filter(booking => {
    switch (activeTab) {
      case 'pending':
        return booking.status === 'pending';
      case 'confirmed':
        return booking.status === 'confirmed';
      case 'active':
        return booking.status === 'confirmed' && new Date(booking.checkIn) <= new Date() && new Date(booking.checkOut) >= new Date();
      case 'completed':
        return booking.status === 'completed';
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'overdue':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleApproveBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to approve this booking?')) {
      alert(`Booking ${bookingId} approved successfully!`);
    }
  };

  const handleRejectBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      alert(`Booking ${bookingId} rejected`);
    }
  };

  const handleContactTenant = (tenantPhone: string) => {
    window.open(`tel:${tenantPhone}`);
  };

  const handleEmailTenant = (tenantEmail: string) => {
    window.open(`mailto:${tenantEmail}`);
  };

  const calculateTotalRevenue = () => {
    return bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((total, booking) => total + booking.price, 0);
  };

  const calculatePendingRevenue = () => {
    return bookings
      .filter(b => b.paymentStatus === 'pending' && b.status === 'confirmed')
      .reduce((total, booking) => total + booking.price, 0);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header with gradient background */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl backdrop-blur-xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Booking Management
          </h2>
          <p className="text-emerald-100 text-lg">Manage your property bookings and tenant requests</p>
        </div>
      </div>

      {/* Enhanced Revenue Overview with animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-teal-600/20 backdrop-blur-xl rounded-2xl border border-emerald-400/30 p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold">₹</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-300 text-xs font-medium bg-emerald-500/20 px-2 py-1 rounded-full">+12.5%</span>
              </div>
            </div>
            <p className="text-emerald-200 text-sm font-medium mb-2">Total Revenue</p>
            <p className="text-4xl font-bold text-white mb-2">NPR {calculateTotalRevenue().toLocaleString()}</p>
            <div className="flex items-center text-emerald-300 text-sm">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Increased from last month
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-500/20 via-orange-600/10 to-amber-600/20 backdrop-blur-xl rounded-2xl border border-yellow-400/30 p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold">⏱</span>
              </div>
              <div className="text-right">
                <span className="text-yellow-300 text-xs font-medium bg-yellow-500/20 px-2 py-1 rounded-full">Pending</span>
              </div>
            </div>
            <p className="text-yellow-200 text-sm font-medium mb-2">Pending Revenue</p>
            <p className="text-4xl font-bold text-white mb-2">NPR {calculatePendingRevenue().toLocaleString()}</p>
            <div className="flex items-center text-yellow-300 text-sm">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Awaiting payment
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-purple-600/10 to-indigo-600/20 backdrop-blur-xl rounded-2xl border border-blue-400/30 p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold">�</span>
              </div>
              <div className="text-right">
                <span className="text-blue-300 text-xs font-medium bg-blue-500/20 px-2 py-1 rounded-full">Active</span>
              </div>
            </div>
            <p className="text-blue-200 text-sm font-medium mb-2">Active Bookings</p>
            <p className="text-4xl font-bold text-white mb-2">{bookings.filter(b => b.status === 'confirmed').length}</p>
            <div className="flex items-center text-blue-300 text-sm">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Currently occupied
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs with animations */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-2xl backdrop-blur-xl"></div>
        <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
          <div className="grid grid-cols-5 gap-2">
            {(['pending', 'confirmed', 'active', 'completed', 'cancelled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg border border-emerald-400/30'
                    : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white border border-transparent'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {tab === 'pending' && '⏱'}
                  {tab === 'confirmed' && '✓'}
                  {tab === 'active' && '�'}
                  {tab === 'completed' && '✨'}
                  {tab === 'cancelled' && '✕'}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                  {bookings.filter(b => 
                    tab === 'pending' ? b.status === 'pending' :
                    tab === 'confirmed' ? b.status === 'confirmed' :
                    tab === 'active' ? b.status === 'confirmed' && new Date(b.checkIn) <= new Date() && new Date(b.checkOut) >= new Date() :
                    tab === 'completed' ? b.status === 'completed' :
                    b.status === 'cancelled'
                  ).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Bookings Grid */}
      <div className="grid gap-6">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Enhanced Property Image */}
                <div className="relative h-48 md:h-auto overflow-hidden rounded-t-2xl md:rounded-l-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2 font-bold">{booking.propertyType}</div>
                      <p className="text-sm font-medium">{booking.propertyType}</p>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)} shadow-lg`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Enhanced Booking Details */}
                <div className="md:col-span-2 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{booking.propertyName}</h3>
                      <p className="text-emerald-200 text-sm mb-3 flex items-center gap-1">
                        <span className="text-emerald-400">•</span>
                        {booking.location}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {booking.amenities.map((amenity: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg text-xs text-emerald-100 border border-emerald-400/30">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white mb-1">NPR {booking.price.toLocaleString()}</p>
                      <p className="text-emerald-200 text-sm">per month</p>
                    </div>
                  </div>

                  {/* Enhanced Tenant Information */}
                  <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-5 mb-4 border border-white/10">
                    <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="text-lg">Profile</span>
                      Tenant Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-emerald-200 text-xs font-medium mb-1">Name</p>
                        <p className="text-white font-semibold">{booking.tenantName}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-emerald-200 text-xs font-medium mb-1">Email</p>
                        <p className="text-white font-semibold">{booking.tenantEmail}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-emerald-200 text-xs font-medium mb-1">Phone</p>
                        <p className="text-white font-semibold">{booking.tenantPhone}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-emerald-200 text-xs font-medium mb-1">Request Date</p>
                        <p className="text-white font-semibold">{formatDate(booking.requestDate)}</p>
                      </div>
                    </div>
                    {booking.specialRequests && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-emerald-200 text-xs font-medium mb-2">Special Requests</p>
                        <p className="text-emerald-100 text-sm bg-white/5 rounded-lg p-2">{booking.specialRequests}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-emerald-200 text-xs font-medium mb-1">Check-in</p>
                      <p className="text-white font-semibold">{formatDate(booking.checkIn)}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-emerald-200 text-xs font-medium mb-1">Check-out</p>
                      <p className="text-white font-semibold">{formatDate(booking.checkOut)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <span className={`px-4 py-2 rounded-full text-xs font-bold border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus === 'paid' ? 'Paid' : 
                         booking.paymentStatus === 'pending' ? 'Pending' : 'Overdue'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEmailTenant(booking.tenantEmail)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                        title="Email tenant"
                      >
                        Email
                      </button>
                      <button
                        onClick={() => handleContactTenant(booking.tenantPhone)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                        title="Call tenant"
                      >
                        Call
                      </button>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveBooking(booking.id)}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectBooking(booking.id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailsModal(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 font-bold text-emerald-400">No Bookings</div>
          <h3 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">No {activeTab} bookings</h3>
          <p className="text-emerald-100 text-lg">
            {activeTab === 'pending' ? 'No pending booking requests at the moment' :
             activeTab === 'confirmed' ? 'No confirmed bookings' :
             activeTab === 'active' ? 'No currently active bookings' :
             activeTab === 'completed' ? 'No completed bookings yet' :
             'No cancelled bookings'}
          </p>
        </div>
      )}

      {/* Enhanced Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl transform transition-all duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-white bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Booking Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:text-emerald-200 text-3xl transition-colors transform hover:scale-110"
              >
                ×
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Property Details */}
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">Building</span>
                  Property Information
                </h4>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-emerald-200 text-sm font-medium mb-1">Property Name</p>
                    <p className="text-white font-semibold">{selectedBooking.propertyName}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-emerald-200 text-sm font-medium mb-1">Type</p>
                    <p className="text-white font-semibold">{selectedBooking.propertyType}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-emerald-200 text-sm font-medium mb-1">Location</p>
                    <p className="text-white font-semibold">{selectedBooking.location}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-emerald-200 text-sm font-medium mb-1">Price</p>
                    <p className="text-white font-semibold">NPR {selectedBooking.price.toLocaleString()}/month</p>
                  </div>
                </div>
              </div>

              {/* Tenant Details */}
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">Profile</span>
                  Tenant Information
                </h4>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-emerald-200 text-sm font-medium mb-1">Name</p>
                    <p className="text-white font-semibold">{selectedBooking.tenantName}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-emerald-200 text-sm font-medium mb-1">Email</p>
                    <p className="text-white font-semibold">{selectedBooking.tenantEmail}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-emerald-200 text-sm font-medium mb-1">Phone</p>
                    <p className="text-white font-semibold">{selectedBooking.tenantPhone}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-emerald-200 text-sm font-medium mb-1">Request Date</p>
                    <p className="text-white font-semibold">{formatDate(selectedBooking.requestDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white/10 rounded-2xl p-6 border border-white/20">
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">Calendar</span>
                Booking Period
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-emerald-200 text-sm font-medium mb-1">Check-in</p>
                  <p className="text-white font-semibold">{formatDate(selectedBooking.checkIn)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-emerald-200 text-sm font-medium mb-1">Check-out</p>
                  <p className="text-white font-semibold">{formatDate(selectedBooking.checkOut)}</p>
                </div>
              </div>
            </div>

            {selectedBooking.specialRequests && (
              <div className="mt-6 bg-white/10 rounded-2xl p-6 border border-white/20">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">Notes</span>
                  Special Requests
                </h4>
                <p className="text-emerald-100 bg-white/5 rounded-xl p-3">{selectedBooking.specialRequests}</p>
              </div>
            )}

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] border border-white/20"
              >
                Close
              </button>
              {selectedBooking.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleApproveBooking(selectedBooking.id);
                      setShowDetailsModal(false);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                  >
                    Approve Booking
                  </button>
                  <button
                    onClick={() => {
                      handleRejectBooking(selectedBooking.id);
                      setShowDetailsModal(false);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                  >
                    Reject Booking
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
