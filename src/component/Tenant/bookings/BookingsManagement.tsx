import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../../../context/DarkModeContext';
import PaymentModal from '../payment/PaymentModal';
import MessagePortal from './MessagePortal';

interface Booking {
  id: string;
  _id?: string;
  propertyName: string;
  propertyType: string;
  location: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  price: number;
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'cancelled';
  image: string;
  amenities: string[];
  landlord: string;
  landlordContact: string;
  otherPartyId?: string;
  landlordId?: string;
}

const BookingsManagement: React.FC = () => {
  const { isDarkMode } = useDarkMode();
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);


  useEffect(() => {
    const fetchBookings = async () => {
      console.log('=== BookingsManagement useEffect triggered ===');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      // Create user-specific storage keys
      const userId = JSON.parse(atob(token.split('.')[1])).userId;
      const userBookingsKey = `userBookings_${userId}`;
      const newBookingKey = `newBooking_${userId}`;

      // First check for new booking data before anything else
      const newBookingData = localStorage.getItem(newBookingKey);
      console.log('New booking data from localStorage at start:', newBookingData);

      let bookingsData = [];

      // Try to get persistent bookings from user-specific localStorage first
      const persistentBookings = localStorage.getItem(userBookingsKey);
      if (persistentBookings) {
        try {
          bookingsData = JSON.parse(persistentBookings);
          console.log('Loaded persistent bookings from localStorage:', bookingsData);
        } catch (error) {
          console.error('Error parsing persistent bookings:', error);
        }
      }

      // Fresh API fetch from backend
      try {
        const response = await fetch('http://localhost:5000/api/bookings/tenant', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();

        if (result.success) {
          console.log('✅ API fetch successful:', result.data.length, 'bookings');
          bookingsData = result.data;
          localStorage.setItem(userBookingsKey, JSON.stringify(bookingsData));
        } else {
          console.warn('⚠️ API returned failure status:', result.message);
          setError(result.message || 'Failed to fetch bookings');
          if (persistentBookings) bookingsData = JSON.parse(persistentBookings);
        }
      } catch (err) {
        console.error('❌ Network error fetching bookings:', err);
        setError('Error connecting to server. Displaying cached data.');
        if (persistentBookings) bookingsData = JSON.parse(persistentBookings);
      }

      // Check for new booking in local storage (immediate feedback after booking)
      if (newBookingData) {
        try {
          const newBooking = JSON.parse(newBookingData);
          const newId = newBooking.id || newBooking._id;
          const exists = bookingsData.some((b: any) => (b.id === newId || b._id === newId));
          if (!exists) {
            bookingsData = [newBooking, ...bookingsData];
            localStorage.setItem(userBookingsKey, JSON.stringify(bookingsData));
          }
          localStorage.removeItem(newBookingKey);
        } catch (e) {
          console.error('Error parsing new booking:', e);
          localStorage.removeItem(newBookingKey);
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
      const token = localStorage.getItem('token');
      if (!token) return;

      const userId = JSON.parse(atob(token.split('.')[1])).userId;
      const userBookingsKey = `userBookings_${userId}`;

      console.log('Storage event detected:', e.key, e.newValue);
      if (e.key === userBookingsKey && e.newValue) {
        console.log('Landlord updated bookings, refreshing tenant view...');
        const updatedBookings = JSON.parse(e.newValue);
        console.log('Updated bookings from storage:', updatedBookings);
        setBookings(updatedBookings);

        // Show notification for status changes
        updatedBookings.forEach((booking: any) => {
          const updatedId = booking.id || booking._id;
          const existingBooking = bookings.find(b => (b.id === updatedId || b._id === updatedId));
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
  const forceRefreshBookings = async () => {
    console.log('Force refreshing bookings...');
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required. Please login again.');
      return;
    }

    try {
      // Refresh from API to get the latest data
      const response = await fetch('http://localhost:5000/api/bookings/tenant', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        const userId = JSON.parse(atob(token.split('.')[1])).userId;
        const userBookingsKey = `userBookings_${userId}`;

        // Update user-specific storage and state
        localStorage.setItem(userBookingsKey, JSON.stringify(result.data));
        setBookings(result.data);
        alert('Bookings refreshed successfully!');
      } else {
        alert('Failed to refresh bookings: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Refresh error:', error);
      alert('Error refreshing bookings. Please check your internet connection.');
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

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);


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

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      try {
        // Call API to cancel booking
        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'cancelled' })
        });

        if (response.ok) {
          // Update local state
          const updatedBookings = bookings.map(booking =>
            booking.id === bookingId || booking._id === bookingId
              ? { ...booking, status: 'cancelled' as const, paymentStatus: 'cancelled' as const }
              : booking
          );

          setBookings(updatedBookings);

          // Update user-specific localStorage
          const userId = JSON.parse(atob(token.split('.')[1])).userId;
          const userBookingsKey = `userBookings_${userId}`;
          localStorage.setItem(userBookingsKey, JSON.stringify(updatedBookings));

          alert('Booking cancelled successfully!');
        } else {
          alert('Failed to cancel booking. Please try again.');
        }
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

  const handlePaymentSuccess = async (amount: string, esewaNumber: string) => {
    if (selectedBookingForPayment) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        setIsPaymentModalOpen(false);
        setSelectedBookingForPayment(null);
        return;
      }

      const bookingId = selectedBookingForPayment.id || selectedBookingForPayment._id;
      if (!bookingId) {
        alert('Booking ID missing. Cannot process payment.');
        return;
      }

      try {
        // Call API to update payment status
        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentStatus: 'paid',
            paymentMethod: 'esewa',
            paymentAmount: amount,
            paymentReference: esewaNumber
          })
        });

        if (response.ok) {
          // Update local state
          const updatedBookings = bookings.map(booking => {
            const currentId = booking.id || booking._id;
            if (currentId === bookingId) {
              return {
                ...booking,
                paymentStatus: 'paid' as const
              };
            }
            return booking;
          });

          setBookings(updatedBookings);

          // Update user-specific localStorage
          const userId = JSON.parse(atob(token.split('.')[1])).userId;
          const userBookingsKey = `userBookings_${userId}`;
          localStorage.setItem(userBookingsKey, JSON.stringify(updatedBookings));

          alert(`Payment of Rs. ${amount} successful for ${selectedBookingForPayment.propertyName}!`);
        } else {
          alert('Payment recorded but failed to update status. Please contact support.');
        }
      } catch (error) {
        console.error('Payment update error:', error);
        // Fallback: Update local state even if API fails
        const updatedBookings = bookings.map(booking => {
          const currentId = booking.id || booking._id;
          if (currentId === bookingId) {
            return {
              ...booking,
              paymentStatus: 'paid' as const
            };
          }
          return booking;
        });

        setBookings(updatedBookings);

        const userId = JSON.parse(atob(token.split('.')[1])).userId;
        const userBookingsKey = `userBookings_${userId}`;
        localStorage.setItem(userBookingsKey, JSON.stringify(updatedBookings));

        alert(`Payment of Rs. ${amount} recorded locally for ${selectedBookingForPayment.propertyName}!`);
      }
    }
    setIsPaymentModalOpen(false);
    setSelectedBookingForPayment(null);
  };

  const handleContactLandlord = (booking: Booking) => {
    // Set selected booking and open message portal
    setSelectedBookingForMessage(booking);
    setIsMessagePortalOpen(true);
  };

  const handleMessageSent = async (message: string) => {
    const token = localStorage.getItem('token');
    if (!token || !selectedBookingForMessage) return;

    let recipientId = '';
    try {
      recipientId = selectedBookingForMessage.otherPartyId || selectedBookingForMessage.landlordId || `fallback_landlord_${selectedBookingForMessage.id}`;

      // If we fall back, we will still allow the message to dispatch into the local offline storage array.

      const messagePayload = {
        recipientId: recipientId,
        subject: `Regarding ${selectedBookingForMessage.propertyName} - ${selectedBookingForMessage.propertyType}`,
        content: message,
        type: 'landlord'
      };

      if (recipientId.startsWith('fallback_landlord_')) {
        throw new Error("Offline offline fallback mode, bypass backend.");
      }

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload)
      });

      const result = await response.json();
      if (result.success) {
        alert("Message sent successfully and saved to your conversation history!");
      } else {
        throw new Error(`Server returned: ${result.message}`);
      }
    } catch (err) {
      console.error("Message send error:", err);
      // Fallback local storage
      const userId = JSON.parse(atob(token.split('.')[1])).userId;
      const tenantMessagesKey = `tenantMessages_${userId}`;

      const existingTenantMessages = JSON.parse(localStorage.getItem(tenantMessagesKey) || '[]');
      const tenantMessage = {
        id: Date.now().toString(),
        recipient: selectedBookingForMessage.landlord,
        recipientId: recipientId,
        recipientRole: 'Landlord',
        subject: `Regarding ${selectedBookingForMessage.propertyName} - ${selectedBookingForMessage.propertyType}`,
        content: message,
        timestamp: new Date().toISOString(),
        bookingId: selectedBookingForMessage.id,
        read: false,
        type: 'sent'
      };

      existingTenantMessages.unshift(tenantMessage);
      localStorage.setItem(tenantMessagesKey, JSON.stringify(existingTenantMessages));
      alert('Message sent successfully! (Offline mode)');
    }
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <p className={`text-xs font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Manage your property stays and applications</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex flex-wrap p-1.5 mb-10 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
        }`}>
        {(['active', 'upcoming', 'past', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[120px] px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 ${activeTab === tab
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
              : isDarkMode
                ? 'text-gray-400 hover:text-emerald-400 hover:bg-gray-700/50'
                : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-50'
              }`}
          >
            <span className="flex items-center justify-center gap-2">
              {tab}
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab
                ? 'bg-white/20 text-white'
                : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                }`}>
                {bookings.filter(b =>
                  tab === 'active' ? (b.status === 'confirmed' || b.status === 'pending') :
                    tab === 'upcoming' ? new Date(b.checkIn) > new Date() :
                      tab === 'past' ? b.status === 'completed' :
                        b.status === 'cancelled'
                ).length}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className={`font-black text-xl animate-pulse uppercase tracking-widest ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>Loading Stays...</p>
        </div>
      ) : error ? (
        <div className={`p-10 rounded-3xl border text-center ${isDarkMode ? 'bg-red-900/10 border-red-800/30' : 'bg-red-50 border-red-100'
          }`}>
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Connection Issue</h3>
          <p className={`font-bold italic ${isDarkMode ? 'text-red-400/80' : 'text-red-600/80'}`}>{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {currentBookings.length > 0 ? (
            currentBookings.map((booking) => (
              <div key={booking.id} className={`group relative rounded-3xl border overflow-hidden transition-all duration-500 transform hover:scale-[1.01] hover:shadow-2xl ${isDarkMode
                ? 'bg-gray-800 border-gray-700 hover:border-emerald-500/50'
                : 'bg-white border-gray-200 hover:border-emerald-400'
                }`}>
                <div className="grid md:grid-cols-5 gap-0">
                  {/* Property Image */}
                  <div className="relative md:col-span-2 h-72 overflow-hidden">
                    <img
                      src={booking.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'}
                      alt={booking.propertyName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">{booking.propertyType}</p>
                      <h3 className="text-white text-xl font-black italic">{booking.propertyName}</h3>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="md:col-span-3 p-8 flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-3">
                        <p className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className="text-lg">📍</span> {booking.location}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {booking.amenities.slice(0, 4).map((amenity, index) => (
                            <span key={index} className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}>
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NPR {booking.price.toLocaleString()}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Monthly Total</p>
                      </div>
                    </div>

                    <div className={`grid grid-cols-2 gap-8 p-6 mb-8 rounded-2xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'
                      }`}>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Check-in</p>
                        <p className={`text-lg font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(booking.checkIn)}</p>
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Check-out</p>
                        <p className={`text-lg font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(booking.checkOut)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          }`}>
                          {booking.landlord.charAt(0)}
                        </div>
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Landlord</p>
                          <p className={`font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.landlord}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleContactLandlord(booking)}
                          className={`px-6 py-3 rounded-2xl font-black text-sm uppercase transition-all duration-300 border ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                            : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50 shadow-sm'
                            }`}
                        >
                          Chat
                        </button>

                        {booking.status === 'confirmed' && booking.paymentStatus === 'pending' && (
                          <button
                            onClick={() => handleMakePayment(booking)}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-sm uppercase shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300"
                          >
                            Pay Now
                          </button>
                        )}

                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className={`px-4 py-3 rounded-2xl font-black transition-all duration-300 ${isDarkMode ? 'text-red-400 hover:bg-red-400/10' : 'text-red-500 hover:bg-red-50'
                              }`}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-24 rounded-3xl border border-dashed ${isDarkMode ? 'bg-gray-800/20 border-gray-700' : 'bg-gray-50/50 border-gray-200'
              }`}>
              <div className="text-6xl mb-6 grayscale h-20">🛌</div>
              <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No {activeTab} bookings</h3>
              <p className={`font-bold italic mb-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Ready for your next adventure?
              </p>
              {activeTab === 'active' && (
                <button
                  onClick={() => navigate('/tenant/rooms')}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.05] transition-all duration-500"
                >
                  Explore Properties
                </button>
              )}
            </div>
          )}

          {/* Pagination UI */}
          {filteredBookings.length > itemsPerPage && (
            <div className="mt-12 flex justify-center items-center gap-4 pb-8">
              <button
                onClick={() => paginate(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className={`p-3 rounded-2xl border transition-all duration-300 ${isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-emerald-400'
                  : 'bg-white border-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 shadow-sm'
                  } disabled:opacity-30 disabled:cursor-not-allowed group`}
              >
                <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
              </button>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 ${currentPage === i + 1
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-110'
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-100'
                        : 'bg-white text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 shadow-sm'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-3 rounded-2xl border transition-all duration-300 ${isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-emerald-400'
                  : 'bg-white border-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 shadow-sm'
                  } disabled:opacity-30 disabled:cursor-not-allowed group`}
              >
                <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border shadow-lg ${isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
            }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className={`text-2xl transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                ×
              </button>
            </div>
            {/* Booking details content would go here */}
            <div className="text-center py-8">
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-700'}>Detailed booking information</p>
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
