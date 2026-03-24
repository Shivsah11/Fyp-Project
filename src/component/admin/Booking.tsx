import { useState, useEffect } from 'react';

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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'paid' | 'failed' | 'refunded'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock booking data
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        propertyId: 'prop1',
        propertyTitle: 'Modern Studio Apartment',
        propertyLocation: 'Kathmandu, Thamel',
        tenantId: 'tenant1',
        tenantName: 'Alex Johnson',
        tenantEmail: 'alex@example.com',
        landlordId: 'landlord1',
        landlordName: 'John Doe',
        landlordEmail: 'john@example.com',
        checkInDate: '2024-04-01',
        checkOutDate: '2024-04-15',
        totalAmount: 225000,
        status: 'confirmed',
        paymentStatus: 'paid',
        bookingDate: '2024-03-15',
        specialRequests: 'Late check-in requested',
        numberOfGuests: 2,
        reviewRating: 5,
        reviewComment: 'Excellent stay, very clean and well-maintained property.'
      },
      {
        id: '2',
        propertyId: 'prop2',
        propertyTitle: '2BHK Family Apartment',
        propertyLocation: 'Pokhara, Lakeside',
        tenantId: 'tenant2',
        tenantName: 'Sarah Williams',
        tenantEmail: 'sarah@example.com',
        landlordId: 'landlord2',
        landlordName: 'Jane Smith',
        landlordEmail: 'jane@example.com',
        checkInDate: '2024-03-25',
        checkOutDate: '2024-04-10',
        totalAmount: 400000,
        status: 'pending',
        paymentStatus: 'pending',
        bookingDate: '2024-03-20',
        specialRequests: 'Need extra bed for child',
        numberOfGuests: 3
      },
      {
        id: '3',
        propertyId: 'prop3',
        propertyTitle: 'Single Room for Rent',
        propertyLocation: 'Lalitpur, Jawalakhel',
        tenantId: 'tenant3',
        tenantName: 'Mike Brown',
        tenantEmail: 'mike@example.com',
        landlordId: 'landlord3',
        landlordName: 'Mike Johnson',
        landlordEmail: 'mike@example.com',
        checkInDate: '2024-03-10',
        checkOutDate: '2024-03-20',
        totalAmount: 120000,
        status: 'completed',
        paymentStatus: 'paid',
        bookingDate: '2024-03-05',
        numberOfGuests: 1,
        reviewRating: 4,
        reviewComment: 'Good value for money, location is convenient.'
      },
      {
        id: '4',
        propertyId: 'prop4',
        propertyTitle: 'Luxury Villa',
        propertyLocation: 'Bhaktapur',
        tenantId: 'tenant4',
        tenantName: 'Emma Davis',
        tenantEmail: 'emma@example.com',
        landlordId: 'landlord4',
        landlordName: 'Sarah Wilson',
        landlordEmail: 'sarah@example.com',
        checkInDate: '2024-03-05',
        checkOutDate: '2024-03-15',
        totalAmount: 750000,
        status: 'cancelled',
        paymentStatus: 'refunded',
        bookingDate: '2024-03-01',
        cancellationReason: 'Travel plans changed due to emergency',
        cancellationDate: '2024-03-03',
        numberOfGuests: 4
      },
      {
        id: '5',
        propertyId: 'prop5',
        propertyTitle: 'Cozy Studio',
        propertyLocation: 'Kathmandu, Patan',
        tenantId: 'tenant5',
        tenantName: 'David Lee',
        tenantEmail: 'david@example.com',
        landlordId: 'landlord5',
        landlordName: 'Robert Chen',
        landlordEmail: 'robert@example.com',
        checkInDate: '2024-04-20',
        checkOutDate: '2024-04-30',
        totalAmount: 180000,
        status: 'confirmed',
        paymentStatus: 'failed',
        bookingDate: '2024-03-22',
        numberOfGuests: 1
      }
    ];

    setTimeout(() => {
      setBookings(mockBookings);
      setFilteredBookings(mockBookings);
      setIsLoading(false);
    }, 1000);
  }, []);

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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: newStatus }
        : booking
    ));
  };

  const handlePaymentStatusChange = (bookingId: string, newStatus: Booking['paymentStatus']) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId
        ? { ...booking, paymentStatus: newStatus }
        : booking
    ));
  };

  const handleCancelBooking = (bookingId: string, reason: string) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId
        ? {
            ...booking,
            status: 'cancelled',
            paymentStatus: 'refunded',
            cancellationReason: reason,
            cancellationDate: new Date().toISOString().split('T')[0]
          }
        : booking
    ));
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
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
          <div className="text-2xl font-bold text-gray-900">NPR {stats.totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
          <div className="text-2xl font-bold text-gray-900">{stats.confirmed}</div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
          <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
          <div className="text-2xl font-bold text-gray-900">{stats.cancelled}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
          <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search by property, tenant, or landlord..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                    <div className="text-sm text-gray-500">{booking.bookingDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{booking.propertyTitle}</div>
                    <div className="text-sm text-gray-500">{booking.propertyLocation}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{booking.tenantName}</div>
                    <div className="text-sm text-gray-500">{booking.tenantEmail}</div>
                    <div className="text-xs text-gray-400">{booking.numberOfGuests} guests</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.checkInDate}</div>
                    <div className="text-sm text-gray-500">to {booking.checkOutDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">NPR {booking.totalAmount.toLocaleString()}</div>
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
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      View
                    </button>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                        className="text-green-600 hover:text-green-900 transition-colors"
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
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    {booking.paymentStatus === 'pending' && (
                      <button
                        onClick={() => handlePaymentStatusChange(booking.id, 'paid')}
                        className="text-green-600 hover:text-green-900 transition-colors"
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
          <div className="text-center py-8 text-gray-500">
            No bookings found matching your criteria.
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {isViewModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Booking Details #{selectedBooking.id}</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property:</span>
                      <span className="font-medium">{selectedBooking.propertyTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{selectedBooking.propertyLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Tenant Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tenant Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedBooking.tenantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedBooking.tenantEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium">{selectedBooking.numberOfGuests}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Date:</span>
                      <span className="font-medium">{selectedBooking.bookingDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{selectedBooking.checkInDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{selectedBooking.checkOutDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-lg">NPR {selectedBooking.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Status Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Booking Status:</span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Status:</span>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedBooking.specialRequests}</p>
              </div>
            )}

            {/* Cancellation Information */}
            {selectedBooking.status === 'cancelled' && selectedBooking.cancellationReason && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancellation Information</h3>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-gray-700"><strong>Reason:</strong> {selectedBooking.cancellationReason}</p>
                  <p className="text-gray-600 text-sm mt-1"><strong>Date:</strong> {selectedBooking.cancellationDate}</p>
                </div>
              </div>
            )}

            {/* Review Information */}
            {selectedBooking.reviewRating && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Review</h3>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-gray-700 mr-2">Rating:</span>
                    <div className="flex">
                      {renderStars(selectedBooking.reviewRating)}
                    </div>
                  </div>
                  {selectedBooking.reviewComment && (
                    <p className="text-gray-700">{selectedBooking.reviewComment}</p>
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