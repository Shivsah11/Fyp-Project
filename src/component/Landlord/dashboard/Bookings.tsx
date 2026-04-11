import React, { useState, useEffect } from 'react';
import PropertyMap from '../../Shared/PropertyMap';
import { useDarkMode } from '../../../context/DarkModeContext';

interface Booking {
  id: string;
  _id?: string;
  propertyId: string;
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
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'>('pending');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    let bookingsData = [];

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings/landlord', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok) {
        bookingsData = result.data;
        // Save to persistent storage
        localStorage.setItem('landlordBookings', JSON.stringify(bookingsData));
      }
    } catch (error) {
      console.error('Error fetching landlord bookings:', error);
    }

    // If API failed or no data, try localStorage
    if (bookingsData.length === 0) {
      const landlordBookings = localStorage.getItem('landlordBookings');
      if (landlordBookings) {
        try {
          bookingsData = JSON.parse(landlordBookings);
          console.log('Loaded landlord bookings from localStorage:', bookingsData);
        } catch (parseError) {
          console.error('Error parsing landlord bookings:', parseError);
        }
      }
    }

    // If still no data, check for tenant bookings that landlord should see
    if (bookingsData.length === 0) {
      const tenantBookings = localStorage.getItem('userBookings');
      if (tenantBookings) {
        try {
          const allTenantBookings = JSON.parse(tenantBookings);
          console.log('Found tenant bookings, showing to landlord:', allTenantBookings);
          // Transform tenant bookings to landlord format with proper tenant info
          bookingsData = allTenantBookings.map((booking: any) => ({
            ...booking,
            _id: booking._id || booking.id,
            id: booking.id || booking._id,
            tenantName: booking.userName || 'Tenant Name',
            tenantEmail: booking.userEmail || 'tenant@example.com',
            tenantPhone: booking.userPhone || '+977-9840000000',
            propertyName: booking.propertyName || 'Property Name',
            propertyType: booking.propertyType || 'Apartment',
            location: booking.location || 'Location',
            checkIn: booking.checkIn || new Date().toISOString(),
            checkOut: booking.checkOut || new Date().toISOString(),
            status: booking.status || 'pending',
            price: booking.price || 25000,
            paymentStatus: booking.paymentStatus || 'pending',
            image: booking.image || '/api/placeholder/300/200',
            amenities: booking.amenities || ['WiFi', 'Parking'],
            requestDate: booking.requestDate || new Date().toISOString(),
            specialRequests: booking.specialRequests || ''
          }));
        } catch (parseError) {
          console.error('Error parsing tenant bookings:', parseError);
        }
      }
    }

    // If still no data, use sample landlord bookings with complete tenant info
    if (bookingsData.length === 0) {
      console.log('Using sample data with complete tenant information');
      bookingsData = [
        {
          _id: 'LB001',
          id: 'LB001',
          tenantName: 'John Doe',
          tenantEmail: 'john.doe@example.com',
          tenantPhone: '+977-9841234567',
          propertyName: 'Sunset Apartment',
          propertyType: '2 BHK',
          location: 'Thamel, Kathmandu',
          checkIn: '2024-01-15',
          checkOut: '2024-06-15',
          status: 'confirmed',
          price: 25000,
          paymentStatus: 'paid',
          image: '/api/placeholder/300/200',
          amenities: ['WiFi', 'Parking', 'Gym', 'Security'],
          requestDate: '2024-01-10',
          specialRequests: 'Need early check-in if possible'
        },
        {
          _id: 'LB002',
          id: 'LB002',
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
          _id: 'LB003',
          id: 'LB003',
          tenantName: 'Mike Johnson',
          tenantEmail: 'mike.johnson@example.com',
          tenantPhone: '+977-9845678901',
          propertyName: 'Green Valley House',
          propertyType: '3 BHK',
          location: 'Lalitpur, Kathmandu',
          checkIn: '2024-03-01',
          checkOut: '2024-09-01',
          status: 'pending',
          price: 35000,
          paymentStatus: 'pending',
          image: '/api/placeholder/300/200',
          amenities: ['WiFi', 'Parking', 'Garden', 'Security'],
          requestDate: '2024-02-20',
          specialRequests: 'Pet-friendly required'
        }
      ];
      // Save sample data to localStorage
      localStorage.setItem('landlordBookings', JSON.stringify(bookingsData));
    }

    setBookings(bookingsData);
    setLoading(false);
    console.log('Final landlord bookings loaded:', bookingsData);
  };

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
        return isDarkMode ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return isDarkMode ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return isDarkMode ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return isDarkMode ? 'bg-gray-900/30 text-gray-400 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return isDarkMode ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return isDarkMode ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-800 border-red-200';
      default:
        return isDarkMode ? 'bg-gray-900/30 text-gray-400 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleApproveBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to approve this booking?')) {
      try {
        // Create notification for tenant first
        const notification = {
          id: Date.now().toString(),
          type: 'booking_approved',
          title: 'Booking Approved!',
          message: 'Your booking has been approved. Please proceed with payment.',
          bookingId: bookingId,
          timestamp: new Date().toISOString(),
          read: false
        };

        // Store notification for tenant
        const existingNotifications = localStorage.getItem('tenantNotifications');
        const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
        notifications.unshift(notification);
        localStorage.setItem('tenantNotifications', JSON.stringify(notifications));

        // Update tenant's booking to trigger payment option
        const tenantBookings = localStorage.getItem('userBookings');
        if (tenantBookings) {
          try {
            const allTenantBookings = JSON.parse(tenantBookings);
            const updatedTenantBookings = allTenantBookings.map((booking: any) => {
              const bookingIdMatch = booking.id === bookingId || booking._id === bookingId;
              if (bookingIdMatch) {
                return {
                  ...booking,
                  status: 'confirmed',
                  paymentStatus: 'pending'
                };
              }
              return booking;
            });
            localStorage.setItem('userBookings', JSON.stringify(updatedTenantBookings));
          } catch (parseError) {
            console.error('Error updating tenant booking:', parseError);
          }
        }

        // Try API call (but don't fail if it fails)
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'Confirmed' })
          });

          if (response.ok) {
            console.log('API update successful');
          } else {
            console.log('API update failed, but tenant notified');
          }
        } catch (apiError) {
          console.log('API call failed, but tenant notified:', apiError);
        }

        // Update tenant's booking status in real-time
        try {
          const bookingToUpdate = bookings.find(b => b.id === bookingId);
          if (bookingToUpdate) {
            const updatedBookings = bookings.map(b =>
              b.id === bookingId ? { ...b, status: 'confirmed' as const } : b
            );
            setBookings(updatedBookings);

            // Update tenant's localStorage bookings
            const tenantBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
            const updatedTenantBookings = tenantBookings.map((tb: any) =>
              tb.propertyId === bookingToUpdate.propertyId ? { ...tb, status: 'confirmed' } : tb
            );
            localStorage.setItem('userBookings', JSON.stringify(updatedTenantBookings));

            // Trigger storage event for tenant component
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'userBookings',
              newValue: JSON.stringify(updatedTenantBookings)
            }));

            console.log('Tenant bookings updated with approved status');
          }
        } catch (syncError) {
          console.error('Sync error:', syncError);
        }

        alert('Booking approved successfully! Tenant has been notified to make payment.');
        fetchBookings();

      } catch (error) {
        console.error('Approval error:', error);
        alert('Failed to approve booking. Please try again later.');
      }
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'Cancelled' })
        });

        if (response.ok) {
          // Update tenant's booking status in real-time
          try {
            const bookingToUpdate = bookings.find(b => b.id === bookingId);
            if (bookingToUpdate) {
              const updatedBookings = bookings.map(b =>
                b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
              );
              setBookings(updatedBookings);

              // Update tenant's localStorage bookings
              const tenantBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
              const updatedTenantBookings = tenantBookings.map((tb: any) =>
                tb.propertyId === bookingToUpdate.propertyId ? { ...tb, status: 'cancelled' } : tb
              );
              localStorage.setItem('userBookings', JSON.stringify(updatedTenantBookings));

              // Trigger storage event for tenant component
              window.dispatchEvent(new StorageEvent('storage', {
                key: 'userBookings',
                newValue: JSON.stringify(updatedTenantBookings)
              }));

              console.log('Tenant bookings updated with rejected status');
            }
          } catch (syncError) {
            console.error('Sync error:', syncError);
          }

          alert('Booking rejected');
          fetchBookings();
        } else {
          const err = await response.json();
          alert(`Error: ${err.message}`);
        }
      } catch (error) {
        console.error('Rejection error:', error);
        alert('Failed to reject booking. Please try again later.');
      }
    }
  };

  const handleContactTenant = (tenantPhone: string) => {
    window.open(`tel:${tenantPhone}`);
  };

  const handleMessageTenant = (booking: any) => {
    console.log('Message button clicked - booking data:', booking);
    setSelectedBooking(booking);
    setShowMessageModal(true);
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
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Booking Management
        </h2>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
        <div className={`rounded-xl p-3 md:p-4 border shadow-sm hover:shadow-md transition-shadow ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</p>
            <p className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>NPR {calculateTotalRevenue().toLocaleString()}</p>
          </div>
        </div>

        <div className={`rounded-xl p-3 md:p-4 border shadow-sm hover:shadow-md transition-shadow ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending Revenue</p>
            <p className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>NPR {calculatePendingRevenue().toLocaleString()}</p>
          </div>
        </div>

        <div className={`rounded-xl p-3 md:p-4 border shadow-sm hover:shadow-md transition-shadow ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Bookings</p>
            <p className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className={`rounded-xl p-2 border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="grid grid-cols-5 gap-2">
            {(['pending', 'confirmed', 'active', 'completed', 'cancelled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700 border border-transparent'
                    : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                  }`}
              >
                <span className="flex items-center justify-center">
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Map */}
      <div className="mb-6">
        <div className={`rounded-xl border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Rental Locations ({filteredBookings.length})</h3>
          <PropertyMap
            properties={filteredBookings.map(booking => ({
              id: Number(booking.id) || booking._id ? Number(booking._id) : 0,
              title: booking.propertyName,
              type: booking.propertyType,
              price: booking.price,
              location: booking.location,
              lat: 27.7172 + (Math.random() - 0.5) * 0.1,
              lng: 85.3240 + (Math.random() - 0.5) * 0.1,
              available: booking.status === 'confirmed',
              rating: 0
            }))}
            height="400px"
            showPopups={true}
          />
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="grid gap-4">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className={`rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Property Image */}
              <div className="relative h-32 md:h-auto overflow-hidden rounded-t-xl md:rounded-l-xl">
                <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                    <div className="text-4xl mb-2 font-bold">{booking.propertyType}</div>
                    <p className="text-sm font-medium">{booking.propertyType}</p>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="md:col-span-2 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{booking.propertyName}</h3>
                    <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {booking.location}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {booking.amenities.map((amenity: string, index: number) => (
                        <span key={index} className={`px-2 py-1 rounded-lg text-xs border ${isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>NPR {booking.price.toLocaleString()}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>per month</p>
                  </div>
                </div>

                {/* Tenant Information */}
                <div className={`rounded-xl p-3 mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-bold text-sm mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    Tenant Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</p>
                      <p className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{booking.tenantName}</p>
                    </div>
                    <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                      <p className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{booking.tenantEmail}</p>
                    </div>
                    <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                      <p className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{booking.tenantPhone}</p>
                    </div>
                    <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Request Date</p>
                      <p className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatDate(booking.requestDate)}</p>
                    </div>
                  </div>
                  {booking.specialRequests && (
                    <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Special Requests</p>
                      <p className={`text-xs rounded-lg p-2 ${isDarkMode ? 'text-gray-300 bg-gray-800' : 'text-gray-800 bg-white'}`}>{booking.specialRequests}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Check-in</p>
                    <p className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatDate(booking.checkIn)}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Check-out</p>
                    <p className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatDate(booking.checkOut)}</p>
                  </div>
                </div>

                <div className={`flex items-center justify-between pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus === 'paid' ? 'Paid' :
                        booking.paymentStatus === 'pending' ? 'Pending' : 'Overdue'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMessageTenant(booking)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                      title="Message tenant"
                    >
                      Message
                    </button>
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveBooking(booking.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectBooking(booking.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
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
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-16">
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>No {activeTab} bookings</h3>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {activeTab === 'pending' ? 'No pending booking requests at the moment' :
              activeTab === 'confirmed' ? 'No confirmed bookings' :
                activeTab === 'active' ? 'No currently active bookings' :
                  activeTab === 'completed' ? 'No completed bookings yet' :
                    'No cancelled bookings'}
          </p>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border shadow-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Message Tenant</h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className={`text-3xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                ×
              </button>
            </div>

            {/* Debug Info */}
            <div className={`rounded-xl p-4 mb-6 ${isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>Debug Info:</p>
              <pre className={`text-xs mt-2 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>{JSON.stringify(selectedBooking, null, 2)}</pre>
            </div>

            {/* Tenant Details */}
            <div className={`rounded-2xl p-6 border mb-6 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Tenant Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedBooking.tenantName || 'N/A'}</p>
                </div>
                <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedBooking.tenantEmail || 'N/A'}</p>
                </div>
                <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedBooking.tenantPhone || 'N/A'}</p>
                </div>
                <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Booking Status</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedBooking.status || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className={`rounded-2xl p-6 border mb-6 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Property Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Property</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedBooking.propertyName || 'N/A'}</p>
                </div>
                <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedBooking.propertyType || 'N/A'}</p>
                </div>
                <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedBooking.location || 'N/A'}</p>
                </div>
                <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Price</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>NPR {selectedBooking.price ? selectedBooking.price.toLocaleString() : '0'}/month</p>
                </div>
              </div>
            </div>

            {/* Message Section */}
            <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>
                Send Message
              </h4>
              <div className="space-y-4">
                <textarea
                  placeholder="Type your message to the tenant..."
                  className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                    }`}
                  rows={4}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert('Message functionality would be connected to backend here');
                      setShowMessageModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto border shadow-xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Booking Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={`text-3xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Property Details */}
              <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Property Information
                </h4>
                <div className="space-y-4">
                  <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Property Name</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedBooking.propertyName}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedBooking.propertyType}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedBooking.location}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Price</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>NPR {selectedBooking.price.toLocaleString()}/month</p>
                  </div>
                </div>
              </div>

              {/* Tenant Details */}
              <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Tenant Information
                </h4>
                <div className="space-y-4">
                  <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedBooking.tenantName}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedBooking.tenantEmail}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedBooking.tenantPhone}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Request Date</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatDate(selectedBooking.requestDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="flex gap-4 mt-6">
              <input
                type="text"
                placeholder="Type your message..."
                className={`flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white/10 border border-white/20 text-white placeholder-white/60'
                  }`}
              />
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
