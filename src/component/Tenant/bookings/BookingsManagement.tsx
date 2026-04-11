import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentModal from '../payment/PaymentModal';
import MessagePortal from './MessagePortal';

interface Booking {
  id: string;
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
  landlord: string;
  landlordContact: string;
  otherPartyId?: string;
  landlordId?: string;
}

const BookingsManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'past' | 'cancelled'>('active');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [isMessagePortalOpen, setIsMessagePortalOpen] = useState(false);
  const [selectedBookingForMessage, setSelectedBookingForMessage] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      console.log('=== BookingsManagement useEffect triggered ===');
      
      // First check for new booking data before anything else
      const newBookingData = localStorage.getItem('newBooking');
      console.log('New booking data from localStorage at start:', newBookingData);
      
      let bookingsData = [];
      
      // Try to get persistent bookings from localStorage first
      const persistentBookings = localStorage.getItem('userBookings');
      if (persistentBookings) {
        try {
          bookingsData = JSON.parse(persistentBookings);
          console.log('Loaded persistent bookings from localStorage:', bookingsData);
        } catch (error) {
          console.error('Error parsing persistent bookings:', error);
        }
      }
      
      // If no persistent bookings, try API
      if (bookingsData.length === 0) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/bookings/tenant', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const result = await response.json();
          
          if (result.success) {
            bookingsData = result.data;
            // Save to persistent storage
            localStorage.setItem('userBookings', JSON.stringify(bookingsData));
          } else {
            setError(result.message || 'Failed to fetch bookings');
          }
        } catch (err) {
          console.error('Fetch error:', err);
          setError('Error connecting to server. Please check if your backend is running.');
          
          // Fallback to sample data if backend fails
          bookingsData = [
            {
              id: 'BK001',
              propertyName: 'Sunset Apartment',
              propertyType: '2 BHK',
              location: 'Thamel, Kathmandu',
              checkIn: '2024-04-15',
              checkOut: '2024-10-15',
              status: 'pending',
              price: 25000,
              paymentStatus: 'pending',
              image: '/api/placeholder/300/200',
              amenities: ['WiFi', 'Parking', 'Gym', 'Security'],
              landlord: 'John Landlord',
              landlordContact: 'john.landlord@example.com'
            },
            {
              id: 'BK002',
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
              landlord: 'Sarah Property Manager',
              landlordContact: 'sarah@property.com'
            }
          ];
          // Save sample data to persistent storage
          localStorage.setItem('userBookings', JSON.stringify(bookingsData));
        }
      }
      
      // Check for new booking from localStorage (if not already checked above)
      if (newBookingData) {
        try {
          const newBooking = JSON.parse(newBookingData);
          console.log('Parsed new booking:', newBooking);
          // Add new booking to beginning of list
          bookingsData.unshift(newBooking);
          // Clear stored new booking
          localStorage.removeItem('newBooking');
          // Save updated bookings to persistent storage
          localStorage.setItem('userBookings', JSON.stringify(bookingsData));
          console.log('Added new booking to list, total bookings:', bookingsData.length);
        } catch (parseError) {
          console.error('Error parsing new booking:', parseError);
          localStorage.removeItem('newBooking');
        }
      }
      
      setBookings(bookingsData);
      setLoading(false);
      
      // Debug: Log bookings data
      console.log('Final bookings loaded:', bookingsData);
      console.log('Active tab:', activeTab);
      console.log('Filtered bookings:', bookingsData.filter((b: any) => b.status === 'confirmed' || b.status === 'pending'));
    };

    fetchBookings();
  }, [location]); // Add location dependency to trigger on navigation

  // Add effect to listen for landlord approval/rejection/cancellation updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Storage event detected:', e.key, e.newValue);
      if (e.key === 'userBookings' && e.newValue) {
        console.log('Landlord updated bookings, refreshing tenant view...');
        const updatedBookings = JSON.parse(e.newValue);
        console.log('Updated bookings from storage:', updatedBookings);
        setBookings(updatedBookings);
        
        // Show notification for status changes
        updatedBookings.forEach((booking: any) => {
          const existingBooking = bookings.find(b => b.id === booking.id);
          if (existingBooking && existingBooking.status !== booking.status) {
            if (booking.status === 'confirmed') {
              alert(`🎉 Good news! Your booking for ${booking.propertyName} has been APPROVED! Please proceed with payment.`);
            } else if (booking.status === 'cancelled') {
              alert(`❌ Your booking for ${booking.propertyName} has been REJECTED. Please contact the landlord for more information.`);
            } else if (booking.status === 'completed') {
              alert(`✅ Your booking for ${booking.propertyName} has been COMPLETED. Thank you for choosing us!`);
            }
          }
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [bookings]);

  // Force refresh function
  const forceRefreshBookings = () => {
    console.log('Force refreshing bookings...');
    const landlordBookings = localStorage.getItem('landlordBookings');
    if (landlordBookings) {
      console.log('Found landlord bookings:', JSON.parse(landlordBookings));
      
      // Update tenant bookings based on landlord data
      const parsedLandlordBookings = JSON.parse(landlordBookings);
      const tenantBookings = parsedLandlordBookings
        .filter((lb: any) => lb.status !== 'cancelled')
        .map((lb: any) => ({
          id: lb.id,
          propertyName: lb.propertyName,
          propertyType: lb.propertyType,
          location: lb.location,
          checkIn: lb.checkIn,
          checkOut: lb.checkOut,
          status: lb.status,
          price: lb.price,
          paymentStatus: lb.paymentStatus,
          image: lb.image,
          amenities: lb.amenities,
          landlord: lb.tenantName, // This is the tenant name from landlord perspective
          landlordContact: lb.tenantEmail,
          requestDate: lb.requestDate
        }));
      
      console.log('Updated tenant bookings from landlord data:', tenantBookings);
      localStorage.setItem('userBookings', JSON.stringify(tenantBookings));
      setBookings(tenantBookings);
      alert('Bookings refreshed from landlord data!');
    } else {
      alert('No landlord bookings found. Please make sure landlord has accepted bookings.');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    switch (activeTab) {
      case 'active':
        return booking.status === 'confirmed' || booking.status === 'pending';
      case 'upcoming':
        return new Date(booking.checkIn) > new Date();
      case 'past':
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

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        // Update tenant's booking to cancelled
        const tenantBookings = localStorage.getItem('userBookings');
        if (tenantBookings) {
          const allTenantBookings = JSON.parse(tenantBookings);
          const updatedTenantBookings = allTenantBookings.map((booking: any) => {
            const bookingIdMatch = booking.id === bookingId || booking._id === bookingId;
            if (bookingIdMatch) {
              return {
                ...booking,
                status: 'cancelled',
                paymentStatus: 'cancelled'
              };
            }
            return booking;
          });
          localStorage.setItem('userBookings', JSON.stringify(updatedTenantBookings));
          setBookings(updatedTenantBookings);
        }

        // Update landlord's booking to cancelled
        const landlordBookings = localStorage.getItem('landlordBookings');
        if (landlordBookings) {
          const allLandlordBookings = JSON.parse(landlordBookings);
          const updatedLandlordBookings = allLandlordBookings.map((booking: any) => {
            const bookingIdMatch = booking.id === bookingId || booking._id === bookingId;
            if (bookingIdMatch) {
              return {
                ...booking,
                status: 'cancelled',
                paymentStatus: 'cancelled'
              };
            }
            return booking;
          });
          localStorage.setItem('landlordBookings', JSON.stringify(updatedLandlordBookings));
        }

        // Create notification for landlord
        const notification = {
          id: Date.now().toString(),
          type: 'booking_cancelled',
          title: 'Booking Cancelled!',
          message: `A tenant has cancelled their booking. The property is now available for new bookings.`,
          bookingId: bookingId,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        // Store notification for landlord
        const existingNotifications = localStorage.getItem('landlordNotifications');
        const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
        notifications.unshift(notification);
        localStorage.setItem('landlordNotifications', JSON.stringify(notifications));

        alert('Booking cancelled successfully!');
      } catch (error) {
        console.error('Cancel booking error:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const handleMakePayment = (booking: Booking) => {
    try {
      // Validate booking data
      if (!booking || !booking.id) {
        alert('Invalid booking data');
        return;
      }
      
      // Set the selected booking and open payment modal
      setSelectedBookingForPayment(booking);
      setIsPaymentModalOpen(true);
    } catch (error) {
      console.error('Payment modal error:', error);
      alert('Unable to open payment modal. Please try again.');
    }
  };

  const handlePaymentSuccess = (amount: string, esewaNumber: string) => {
    if (selectedBookingForPayment) {
      // Update the booking payment status
      const updatedBookings = bookings.map(booking => {
        if (booking.id === selectedBookingForPayment.id) {
          return {
            ...booking,
            paymentStatus: 'paid' as const
          };
        }
        return booking;
      });
      
      setBookings(updatedBookings);
      localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
      
      // Also update landlord's bookings
      const landlordBookings = localStorage.getItem('landlordBookings');
      if (landlordBookings) {
        const allLandlordBookings = JSON.parse(landlordBookings);
        const updatedLandlordBookings = allLandlordBookings.map((booking: any) => {
          const bookingIdMatch = booking.id === selectedBookingForPayment.id || booking._id === selectedBookingForPayment.id;
          if (bookingIdMatch) {
            return {
              ...booking,
              paymentStatus: 'paid'
            };
          }
          return booking;
        });
        localStorage.setItem('landlordBookings', JSON.stringify(updatedLandlordBookings));
      }
      
      alert(`Payment of Rs. ${amount} successful for ${selectedBookingForPayment.propertyName}!`);
    }
    setIsPaymentModalOpen(false);
    setSelectedBookingForPayment(null);
  };

  const handleContactLandlord = (booking: Booking) => {
    // Set selected booking and open message portal
    setSelectedBookingForMessage(booking);
    setIsMessagePortalOpen(true);
  };

  const handleMessageSent = (message: string) => {
    if (selectedBookingForMessage) {
      // Store the message in tenant's localStorage (sent messages)
      const existingTenantMessages = JSON.parse(localStorage.getItem('tenantMessages') || '[]');
      const tenantMessage = {
        id: Date.now().toString(),
        recipient: selectedBookingForMessage.landlord,
        recipientId: selectedBookingForMessage.otherPartyId || selectedBookingForMessage.landlordId || '',
        recipientRole: 'Landlord',
        subject: `Regarding ${selectedBookingForMessage.propertyName} - ${selectedBookingForMessage.propertyType}`,
        content: message,
        timestamp: new Date().toISOString(),
        bookingId: selectedBookingForMessage.id,
        read: false,
        type: 'sent'
      };
      
      existingTenantMessages.unshift(tenantMessage);
      localStorage.setItem('tenantMessages', JSON.stringify(existingTenantMessages));

      // Store the message in landlord's localStorage (received messages)
      const existingLandlordMessages = JSON.parse(localStorage.getItem('landlordMessages') || '[]');
      const landlordMessage = {
        id: Date.now().toString() + '_landlord', // Unique ID for landlord
        sender: 'Tenant', // In real app, get actual tenant name
        senderId: 'current-tenant-id', // In real app, get actual tenant ID
        senderRole: 'tenant',
        subject: `Regarding ${selectedBookingForMessage.propertyName} - ${selectedBookingForMessage.propertyType}`,
        content: message,
        timestamp: new Date().toISOString(),
        bookingId: selectedBookingForMessage.id,
        isRead: false,
        type: 'landlord',
        avatar: 'T',
        otherPartyId: selectedBookingForMessage.otherPartyId || selectedBookingForMessage.landlordId || '',
        otherPartyRole: 'tenant'
      };
      
      existingLandlordMessages.unshift(landlordMessage);
      localStorage.setItem('landlordMessages', JSON.stringify(existingLandlordMessages));

      // Create notification for landlord about new message
      const existingNotifications = JSON.parse(localStorage.getItem('landlordNotifications') || '[]');
      const messageNotification = {
        id: Date.now().toString(),
        type: 'new_message',
        title: 'New Message Received!',
        message: `A tenant sent you a message regarding ${selectedBookingForMessage.propertyName}`,
        bookingId: selectedBookingForMessage.id,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      existingNotifications.unshift(messageNotification);
      localStorage.setItem('landlordNotifications', JSON.stringify(existingNotifications));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          <button
            onClick={forceRefreshBookings}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            🔄 Sync with Landlord
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
        {(['active', 'upcoming', 'past', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({bookings.filter(b => 
              tab === 'active' ? (b.status === 'confirmed' || b.status === 'pending') :
              tab === 'upcoming' ? new Date(b.checkIn) > new Date() :
              tab === 'past' ? b.status === 'completed' :
              b.status === 'cancelled'
            ).length})
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-gray-500 font-bold text-xl animate-pulse">Loading your bookings...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
           <div className="text-5xl mb-4">⚠️</div>
           <h3 className="text-2xl font-bold text-red-700 mb-2">Connection Issue</h3>
           <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:bg-gray-50 transition-all duration-300 shadow-sm">
              <div className="grid md:grid-cols-3 gap-6 h-full">
                {/* Property Image */}
                <div className="relative h-64 md:h-64">
                  <img 
                    src={booking.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop'}
                    alt={booking.propertyName}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-white">
                      <p className="text-sm font-medium drop-shadow-lg">{booking.propertyType}</p>
                      <p className="text-xs opacity-90 drop-shadow-md">{booking.location}</p>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="md:col-span-2 p-6 flex flex-col h-64 md:h-64">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.propertyName}</h3>
                      <p className="text-gray-600 text-sm mb-2">📍 {booking.location}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {booking.amenities.map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-700">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">NPR {booking.price.toLocaleString()}</p>
                      <p className="text-gray-600 text-sm">per month</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Check-in</p>
                      <p className="text-gray-900 font-medium">{formatDate(booking.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Check-out</p>
                      <p className="text-gray-900 font-medium">{formatDate(booking.checkOut)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
                    <div>
                      <p className="text-gray-600 text-sm">Landlord</p>
                      <p className="text-gray-900 font-medium">{booking.landlord}</p>
                      <p className="text-gray-700 text-sm">{booking.landlordContact}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus === 'paid' ? '✓ Paid' : 
                         booking.paymentStatus === 'pending' ? '⏳ Pending' : '⚠️ Overdue'}
                      </span>
                      <button
                        onClick={() => handleContactLandlord(booking)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Contact
                      </button>
                      {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
                        <button
                          onClick={() => handleMakePayment(booking)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Make Payment
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredBookings.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab} bookings</h3>
          <p className="text-gray-700">
            {activeTab === 'active' ? 'You currently have no active bookings' :
             activeTab === 'upcoming' ? 'You have no upcoming bookings' :
             activeTab === 'past' ? 'You have no past bookings' :
             'You have no cancelled bookings'}
          </p>
          {activeTab === 'active' && (
            <button className="mt-4 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg">
              Explore Properties
            </button>
          )}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>
            {/* Booking details content would go here */}
            <div className="text-center py-8">
              <p className="text-gray-700">Detailed booking information</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedBookingForPayment(null);
        }}
        onPaymentSuccess={handlePaymentSuccess}
        defaultAmount={selectedBookingForPayment?.price?.toString()}
      />

      {/* Message Portal */}
      {selectedBookingForMessage && (
        <MessagePortal
          isOpen={isMessagePortalOpen}
          onClose={() => {
            setIsMessagePortalOpen(false);
            setSelectedBookingForMessage(null);
          }}
          landlordName={selectedBookingForMessage.landlord}
          propertyName={selectedBookingForMessage.propertyName}
          propertyType={selectedBookingForMessage.propertyType}
          onSendMessage={handleMessageSent}
        />
      )}
    </div>
  );
};

export default BookingsManagement;
