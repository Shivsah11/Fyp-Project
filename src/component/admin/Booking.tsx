import { useState, useEffect } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  landlordId: string;
  landlordName: string;
  landlordEmail: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  bookingDate: string;
  specialRequests?: string;
  numberOfGuests: number;
  reviewRating?: number;
  reviewComment?: string;
  cancellationReason?: string;
  cancellationDate?: string;
}

const Booking = () => {
  const { isDarkMode } = useDarkMode();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'paid' | 'failed' | 'refunded'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch bookings from backend
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        setFilteredBookings(data.bookings || []);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter bookings
  useEffect(() => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.landlordName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.propertyLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === paymentFilter);
    }

    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(today.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(booking => 
        new Date(booking.bookingDate) >= filterDate
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, paymentFilter, dateFilter]);

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return isDarkMode 
          ? 'bg-green-900/30 text-green-400 border-green-700'
          : 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return isDarkMode 
          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700'
          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return isDarkMode 
          ? 'bg-red-900/30 text-red-400 border-red-700'
          : 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return isDarkMode 
          ? 'bg-blue-900/30 text-blue-400 border-blue-700'
          : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'refunded':
        return isDarkMode 
          ? 'bg-purple-900/30 text-purple-400 border-purple-700'
          : 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return isDarkMode 
          ? 'bg-gray-900/30 text-gray-400 border-gray-700'
          : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return isDarkMode 
          ? 'bg-green-900/30 text-green-400 border-green-700'
          : 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return isDarkMode 
          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700'
          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return isDarkMode 
          ? 'bg-red-900/30 text-red-400 border-red-700'
          : 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return isDarkMode 
          ? 'bg-purple-900/30 text-purple-400 border-purple-700'
          : 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return isDarkMode 
          ? 'bg-gray-900/30 text-gray-400 border-gray-700'
          : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) await fetchBookings();
      else alert('Failed to update booking status');
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const handlePaymentStatusChange = async (bookingId: string, newStatus: Booking['paymentStatus']) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}/payment`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });
      if (response.ok) await fetchBookings();
      else alert('Failed to update payment status');
    } catch (error) {
      console.error('Payment update error:', error);
    }
  };

  const handleCancelBooking = async (bookingId: string, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', cancellationReason: reason }),
      });
      if (response.ok) await fetchBookings();
      else alert('Failed to cancel booking');
    } catch (error) {
      console.error('Cancel booking error:', error);
    }
  };

  const viewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalRevenue: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-gray-600 ${isDarkMode ? 'text-gray-400' : ''}`}>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="flex gap-4">
        <div className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
          <div className="h-1 bg-blue-500 w-full"></div>
          <div className="px-5 py-6 flex flex-col gap-1">
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NPR {stats.totalRevenue.toLocaleString()}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Total Revenue</div>
          </div>
        </div>
        <div className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
          <div className="h-1 bg-gray-500 w-full"></div>
          <div className="px-5 py-6 flex flex-col gap-1">
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Total Bookings</div>
          </div>
        </div>
        <div className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
          <div className="h-1 bg-green-500 w-full"></div>
          <div className="px-5 py-6 flex flex-col gap-1">
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{stats.confirmed}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Confirmed</div>
          </div>
        </div>
        <div className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
          <div className="h-1 bg-yellow-500 w-full"></div>
          <div className="px-5 py-6 flex flex-col gap-1">
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.pending}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Pending</div>
          </div>
        </div>
        <div className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
          <div className="h-1 bg-red-500 w-full"></div>
          <div className="px-5 py-6 flex flex-col gap-1">
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>{stats.cancelled}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Cancelled</div>
          </div>
        </div>
        <div className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
          <div className="h-1 bg-indigo-500 w-full"></div>
          <div className="px-5 py-6 flex flex-col gap-1">
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{stats.completed}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Completed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-4 border shadow-sm`}>
        <div className="flex gap-4 mb-3">
          <input
            type="text"
            placeholder="Search by property, tenant, or landlord..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all">All Payment</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <div className="flex justify-center mt-2">
          <button
            style={{ backgroundColor: '#2563eb', color: '#ffffff', border: '1px solid #1d4ed8' }}
            className="px-8 py-2.5 rounded-lg text-sm font-semibold shadow hover:opacity-90 transition-opacity"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border overflow-hidden shadow-sm`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Booking Details</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Property</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tenant</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dates</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amount</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>#{booking.id}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{booking.bookingDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.propertyTitle}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{booking.propertyLocation}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.tenantName}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{booking.tenantEmail}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>{booking.numberOfGuests} guests</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.checkInDate}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>to {booking.checkOutDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NPR {booking.totalAmount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => viewBookingDetails(booking)}
                      className={`text-blue-600 hover:text-blue-900 transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : ''}`}
                    >
                      View
                    </button>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                        className={`text-green-600 hover:text-green-900 transition-colors ${isDarkMode ? 'text-green-400 hover:text-green-300' : ''}`}
                      >
                        Confirm
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          const reason = prompt('Enter cancellation reason:');
                          if (reason) handleCancelBooking(booking.id, reason);
                        }}
                        className={`text-red-600 hover:text-red-900 transition-colors ${isDarkMode ? 'text-red-400 hover:text-red-300' : ''}`}
                      >
                        Cancel
                      </button>
                    )}
                    {booking.paymentStatus === 'pending' && (
                      <button
                        onClick={() => handlePaymentStatusChange(booking.id, 'paid')}
                        className={`text-green-600 hover:text-green-900 transition-colors ${isDarkMode ? 'text-green-400 hover:text-green-300' : ''}`}
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBookings.length === 0 && (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No bookings found matching your criteria.
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {isViewModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-start mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Booking Details #{selectedBooking.id}</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className={`text-2xl ${isDarkMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Information */}
              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Property Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Property:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.propertyTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Location:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.propertyLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Tenant Information */}
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Tenant Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Name:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.tenantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Email:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.tenantEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Guests:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.numberOfGuests}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Booking Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Booking Date:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.bookingDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Check-in:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.checkInDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Check-out:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.checkOutDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Total Amount:</span>
                      <span className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NPR {selectedBooking.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Status Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Booking Status:</span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Payment Status:</span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                        {selectedBooking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {selectedBooking.specialRequests && (
              <div className="mt-6">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Special Requests</h3>
                <p className={`${isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-50'} p-3 rounded-lg`}>{selectedBooking.specialRequests}</p>
              </div>
            )}

            {/* Cancellation Information */}
            {selectedBooking.status === 'cancelled' && selectedBooking.cancellationReason && (
              <div className="mt-6">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Cancellation Information</h3>
                <div className={`${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'} p-3 rounded-lg`}>
                  <p className={isDarkMode ? 'text-red-400' : 'text-red-700'}><strong>Reason:</strong> {selectedBooking.cancellationReason}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'} mt-1`}><strong>Date:</strong> {selectedBooking.cancellationDate}</p>
                </div>
              </div>
            )}

            {/* Review Information */}
            {selectedBooking.reviewRating && (
              <div className="mt-6">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Guest Review</h3>
                <div className={`${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} p-3 rounded-lg`}>
                  <div className="flex items-center mb-2">
                    <span className={`mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Rating:</span>
                    <div className="flex">
                      {renderStars(selectedBooking.reviewRating)}
                    </div>
                  </div>
                  {selectedBooking.reviewComment && (
                    <p className={isDarkMode ? 'text-blue-400' : 'text-blue-700'}>{selectedBooking.reviewComment}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;