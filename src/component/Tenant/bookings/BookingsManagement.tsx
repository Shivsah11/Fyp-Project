import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
}

const BookingsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'past' | 'cancelled'>('active');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Sample booking data
  const bookings: Booking[] = [
    {
      id: 'BK001',
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
      landlord: 'Rajesh Sharma',
      landlordContact: '+977-9841234567'
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
      paymentStatus: 'pending',
      image: '/api/placeholder/300/200',
      amenities: ['WiFi', 'Balcony', 'Security'],
      landlord: 'Sita Karki',
      landlordContact: '+977-9849876543'
    },
    {
      id: 'BK003',
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
      landlord: 'Bikram Thapa',
      landlordContact: '+977-9845678901'
    }
  ];

  const filteredBookings = bookings.filter(booking => {
    switch (activeTab) {
      case 'active':
        return booking.status === 'confirmed';
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
      // Handle booking cancellation
      alert(`Booking ${bookingId} cancelled`);
    }
  };

  const handleContactLandlord = (booking: Booking) => {
    // Store the contact information in localStorage for the messages component to use
    localStorage.setItem('newMessageRecipient', booking.landlord);
    localStorage.setItem('newMessageSubject', `Regarding ${booking.propertyName} - ${booking.propertyType}`);
    localStorage.setItem('newMessageType', 'landlord');
    
    // Navigate to messages page
    navigate('/dashboard', { state: { activeSection: 'messages' } });
    
    // Update the active section in the dashboard
    setTimeout(() => {
      const dashboardElement = document.querySelector('[data-section="messages"]') as HTMLButtonElement;
      if (dashboardElement) {
        dashboardElement.click();
      }
    }, 100);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h2>
        <p className="text-gray-700">Manage your property bookings and reservations</p>
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
              tab === 'active' ? b.status === 'confirmed' :
              tab === 'upcoming' ? new Date(b.checkIn) > new Date() :
              tab === 'past' ? b.status === 'completed' :
              b.status === 'cancelled'
            ).length})
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      <div className="grid gap-6">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:bg-gray-50 transition-all duration-300 shadow-sm">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Property Image */}
              <div className="relative h-48 md:h-auto">
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">🏠</div>
                    <p className="text-sm font-medium">{booking.propertyType}</p>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="md:col-span-2 p-6">
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

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
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
    </div>
  );
};

export default BookingsManagement;
