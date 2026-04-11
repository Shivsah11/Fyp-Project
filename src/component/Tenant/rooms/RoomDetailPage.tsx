import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropertyMap from '../../Shared/PropertyMap';

interface Room {
  id: number;
  landlordId: string;
  title: string;
  type: string;
  price: number;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  available: boolean;
  rating: number;
  images: string[];
  amenities: string[];
  description: string;
  landlord: string;
  contactInfo: string;
  lat?: number;
  lng?: number;
}

const RoomDetailPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/properties/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch room details');
        }

        const result = await response.json();
        
        if (result.success) {
          const mappedRoom = {
            id: result.data._id,
            title: result.data.title,
            type: result.data.type === 'apartment' ? 'Apartment' : 
                  result.data.type === 'house' ? 'House' : 
                  result.data.type === 'studio' ? 'Studio' : 
                  result.data.type === 'room' ? '1 Bedroom' : result.data.type,
            price: Number(typeof result.data.price === 'string' ? result.data.price.replace(/[^0-9]/g, '') : result.data.price),
            location: result.data.location,
            beds: result.data.beds || 0,
            baths: result.data.baths || 0,
            sqft: result.data.area || 0,
            available: result.data.status === 'Available' || result.data.status === 'active',
            rating: result.data.rating || 0,
            images: result.data.image ? [result.data.image] : [],
            amenities: result.data.amenities || [],
            description: result.data.description || '',
            landlordId: result.data.landlordId ? result.data.landlordId._id : '',
            landlord: result.data.landlordId ? `${result.data.landlordId.firstName} ${result.data.landlordId.lastName}` : 'Unknown Landlord',
            contactInfo: result.data.landlordId ? result.data.landlordId.email : '',
            // Add coordinates - for demo, use Kathmandu coordinates with some randomization
            lat: result.data.lat || 27.7172 + (Math.random() - 0.5) * 0.05,
            lng: result.data.lng || 85.3240 + (Math.random() - 0.5) * 0.05
          };
          setRoom(mappedRoom);
        } else {
          setError(result.message || 'Room not found');
        }
      } catch (err: any) {
        console.error("Error fetching room details:", err);
        setError(err.message || 'Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !room.landlordId) {
      alert("Landlord information is not available for this room.");
      return;
    }
    
    setIsSendingMessage(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          landlordId: room.landlordId,
          roomId: room.id,
          subject: contactSubject,
          message: contactMessage,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Message sent successfully!');
        setContactSubject('');
        setContactMessage('');
        setShowContactModal(false);
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleBookRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) {
      alert("Room information is not available.");
      return;
    }
    
    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates.");
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          roomId: room.id,
          landlordId: room.landlordId,
          propertyName: room.title,
          propertyType: room.type,
          location: room.location,
          price: room.price,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          specialRequests: specialRequests,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Room booked successfully! The landlord will review your booking request.');
        navigate('/tenant/dashboard?tab=bookings');
      } else {
        alert(data.message || 'Failed to book room');
      }
    } catch (error) {
      console.error('Error booking room:', error);
      // Save to localStorage for demo and cross-component communication
      const bookingData = {
        id: Date.now().toString(),
        propertyId: room.id,
        propertyName: room.title,
        propertyType: room.type,
        location: room.location,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        price: room.price,
        status: 'pending',
        paymentStatus: 'pending',
        image: room.images?.[0] || '',
        amenities: room.amenities || [],
        requestDate: new Date().toISOString(),
        specialRequests: specialRequests,
        userName: localStorage.getItem('userName') || 'Tenant User',
        userEmail: localStorage.getItem('userEmail') || 'tenant@example.com',
        userPhone: localStorage.getItem('userPhone') || '+977-9840000000',
        landlord: room.landlord,
        landlordContact: room.contactInfo
      };

      // Get existing bookings and check for duplicates
      const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
      
      // Check if user already booked this property
      const existingBooking = existingBookings.find((b: any) => 
        b.propertyId === room.id
      );
      
      if (existingBooking) {
        alert('You have already booked this property! Check your bookings section.');
        return;
      }
      
      const updatedBookings = [bookingData, ...existingBookings];
      
      // Save to multiple localStorage keys for reliability
      localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
      localStorage.setItem('newBooking', JSON.stringify(bookingData));
      
      // Trigger storage event for BookingsManagement component
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'newBooking',
        newValue: JSON.stringify(bookingData)
      }));

      alert('Booking request submitted! (Demo mode - saved locally)');
      navigate('/tenant/dashboard?tab=bookings');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold text-xl animate-pulse">Loading room details...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-2xl font-bold text-red-700 mb-2">Room Not Found</h3>
        <p className="text-red-600 mb-4">{error || 'The room you are looking for does not exist.'}</p>
        <button 
          onClick={() => navigate('/tenant/dashboard?tab=rooms')}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          Back to Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/tenant/dashboard?tab=rooms')}
        className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        ← Back to Rooms
      </button>

      {/* Room Details */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
        {/* Image Section */}
        {room.images && room.images.length > 0 && room.images[0] && room.images[0].trim() !== '' ? (
          <div className="relative h-64 bg-gray-100 rounded-t-2xl overflow-hidden">
            <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover" />
            <button
              onClick={() => setShowGalleryModal(true)}
              className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              View All Images ({room.images.length})
            </button>
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-t-2xl">
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-center">
                <div className="w-24 h-24 bg-white/20 rounded-xl mx-auto mb-2 flex items-center justify-center text-4xl">📷</div>
                <p className="text-lg">No Image Available</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">{room.title}</h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                📍 {room.location}
                <span className={`px-2 py-1 text-xs rounded-full ${room.available
                  ? 'bg-green-200 text-green-600 border-green-300'
                  : 'bg-red-200 text-red-600 border-red-300'
                  }`}>
                  {room.available ? 'Available' : 'Occupied'}
                </span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">${room.price}</div>
              <div className="text-sm text-gray-600">/month</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-400 text-sm">⭐</span>
                <span className="text-sm text-gray-900">{room.rating} (24 reviews)</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-100 rounded-lg p-2 text-center">
              <div className="text-lg mb-1">🛏️</div>
              <div className="text-sm text-gray-900 font-semibold">{room.beds}</div>
              <div className="text-xs text-gray-600">Bedrooms</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-2 text-center">
              <div className="text-lg mb-1">🚿</div>
              <div className="text-sm text-gray-900 font-semibold">{room.baths}</div>
              <div className="text-xs text-gray-600">Bathrooms</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-2 text-center">
              <div className="text-lg mb-1">📐</div>
              <div className="text-sm text-gray-900 font-semibold">{room.sqft}</div>
              <div className="text-xs text-gray-600">Sq Ft</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-2 text-center">
              <div className="text-lg mb-1">🏠</div>
              <div className="text-sm text-gray-900 font-semibold">{room.type}</div>
              <div className="text-xs text-gray-600">Type</div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{room.description}</p>
          </div>

          {/* Location Map */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Location</h2>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-sm text-gray-600 mb-3">📍 {room.location}</p>
              <PropertyMap
                properties={[{
                  id: room.id,
                  title: room.title,
                  type: room.type,
                  price: room.price,
                  location: room.location,
                  lat: room.lat || 27.7172,
                  lng: room.lng || 85.3240,
                  available: room.available,
                  rating: room.rating
                }]}
                height="250px"
                center={[room.lat || 27.7172, room.lng || 85.3240]}
                zoom={15}
                showPopups={true}
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Amenities</h2>
            <div className="grid grid-cols-3 gap-2">
              {room.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-400 text-sm">✓</span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Landlord Information */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Landlord Information</h2>
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-900 font-semibold mb-1">{room.landlord}</p>
              <p className="text-xs text-gray-500">📧 {room.contactInfo}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={() => setShowBookingModal(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all duration-300 shadow-md"
            >
              Book Room
            </button>
            <button 
              onClick={() => setShowContactModal(true)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-bold transition-all duration-300 border border-gray-300 shadow-sm"
            >
              Contact Landlord
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showGalleryModal && room && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setShowGalleryModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl transition-colors z-10"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Property Photos</h3>
            
            <div className="overflow-y-auto max-h-[70vh]">
              {room.images && room.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {room.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`${room.title} - Photo ${index + 1}`} 
                        className="w-full h-64 object-cover rounded-xl border border-gray-200"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        Photo {index + 1} of {room.images.length}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">📷</div>
                  <p className="text-gray-500 text-lg">No photos available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Landlord Modal */}
      {showContactModal && room && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Landlord</h3>
            <p className="text-gray-500 mb-6 text-sm">You are messaging {room.landlord} regarding {room.title}</p>
            
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="I am interested in..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Hello, I would like to know if..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSendingMessage}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-md mt-4"
              >
                {isSendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && room && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Book Room</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="font-bold text-gray-900 mb-2">{room.title}</h4>
                <p className="text-gray-600 text-sm">{room.location}</p>
                <p className="text-2xl font-bold text-green-600 mt-2">NPR {room.price.toLocaleString()}/month</p>
              </div>
            </div>

            <form onSubmit={handleBookRoom}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Check-in Date</label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Check-out Date</label>
                <input
                  type="date"
                  required
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Special Requests (Optional)</label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requirements or requests..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-md"
              >
                Book Room
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetailPage;
