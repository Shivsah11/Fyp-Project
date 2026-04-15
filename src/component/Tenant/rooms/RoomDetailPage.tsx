import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropertyMap from '../../Shared/PropertyMap';
import { useDarkMode } from '../../../context/DarkModeContext';

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
  const { isDarkMode } = useDarkMode();
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
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [bookingDuration, setBookingDuration] = useState<number>(0);

  // Helper function to calculate months from days
  const calculateMonths = (days: number): number => {
    if (days <= 30) return 1;

    const fullMonths = Math.floor(days / 30);
    const remainingDays = days % 30;

    // If there are more than 15 remaining days, count as another month
    return remainingDays > 15 ? fullMonths + 1 : fullMonths;
  };

  // Calculate total price whenever dates change
  useEffect(() => {
    if (checkInDate && checkOutDate && room) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const timeDiff = end.getTime() - start.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

      setBookingDuration(days);

      // Calculate total price
      const months = calculateMonths(days);
      setTotalPrice(room.price * months);
    } else {
      setTotalPrice(room ? room.price : 0);
      setBookingDuration(0);
    }
  }, [checkInDate, checkOutDate, room]);

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
            images: result.data.images && result.data.images.length > 0 ? result.data.images : (result.data.image ? [result.data.image] : []),
            amenities: result.data.amenities || [],
            description: result.data.description || '',
            landlordId: result.data.landlordId ? result.data.landlordId._id : '',
            landlord: result.data.landlordId ? `${result.data.landlordId.firstName} ${result.data.landlordId.lastName}` : 'Unknown Landlord',
            contactInfo: result.data.landlordId ? result.data.landlordId.email : '',
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

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to book a room.');
      return;
    }

    try {
      const bookingPayload = {
        propertyId: room.id,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numberOfGuests: 1,
        specialRequests: specialRequests,
        totalPrice: totalPrice,
        bookingDuration: bookingDuration
      };

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingPayload),
      });

      const data = await response.json();

      if (data.success) {
        const userId = JSON.parse(atob(token.split('.')[1])).userId;
        const newBookingKey = `newBooking_${userId}`;

        const displayBookingData = {
          id: data.data._id,
          propertyName: room.title,
          propertyType: room.type,
          location: room.location,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          price: room.price,
          totalAmount: totalPrice,
          status: 'pending',
          paymentStatus: 'pending',
          image: room.images?.[0] || '',
          amenities: room.amenities || [],
          landlord: room.landlord,
          landlordId: room.landlordId,
          landlordContact: room.contactInfo
        };

        const existingNewBooking = localStorage.getItem(newBookingKey);
        if (!existingNewBooking) {
          localStorage.setItem(newBookingKey, JSON.stringify(displayBookingData));
          window.dispatchEvent(new StorageEvent('storage', {
            key: newBookingKey,
            newValue: JSON.stringify(displayBookingData)
          }));
        }

        alert('Room booked successfully! Your booking request has been sent to the landlord.');
        navigate('/tenant/dashboard?tab=bookings');
      } else {
        alert(data.message || 'Failed to book room');
      }
    } catch (error) {
      console.error('Error booking room:', error);
      const userId = JSON.parse(atob(token.split('.')[1])).userId;
      const userBookingsKey = `userBookings_${userId}`;
      const newBookingKey = `newBooking_${userId}`;

      const bookingData = {
        id: Date.now().toString(),
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
        landlord: room.landlord,
        landlordId: room.landlordId,
        landlordContact: room.contactInfo
      };

      const existingBookings = JSON.parse(localStorage.getItem(userBookingsKey) || '[]');
      const existingBooking = existingBookings.find((b: any) =>
        b.propertyName === room.title || b.id === room.id
      );

      if (existingBooking) {
        alert('You have already booked this property! Check your bookings section.');
        return;
      }

      const updatedBookings = [bookingData, ...existingBookings];
      localStorage.setItem(userBookingsKey, JSON.stringify(updatedBookings));
      localStorage.setItem(newBookingKey, JSON.stringify(bookingData));
      window.dispatchEvent(new StorageEvent('storage', {
        key: newBookingKey,
        newValue: JSON.stringify(bookingData)
      }));

      alert('Booking request submitted! (Offline mode - will sync when online)');
      navigate('/tenant/dashboard?tab=bookings');
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center py-32 space-y-6 min-h-screen ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className={`font-black text-xl animate-pulse uppercase tracking-widest ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>Synchronizing Details...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full p-10 text-center rounded-[32px] border shadow-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-red-100'}`}>
          <div className="text-6xl mb-6 grayscale h-20">⚠️</div>
          <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-red-700'}`}>Estate Not Found</h3>
          <p className={`font-bold italic mb-8 ${isDarkMode ? 'text-gray-500' : 'text-red-900/60'}`}>{error || 'The requested property has been Delisted.'}</p>
          <button
            onClick={() => navigate('/tenant/dashboard?tab=rooms')}
            className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.05]"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-4 transition-colors duration-500 ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/tenant/dashboard?tab=rooms')}
          className={`mb-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-3 shadow-lg ${isDarkMode
            ? 'bg-gray-800 text-emerald-400 hover:bg-gray-700 border border-emerald-500/30'
            : 'bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-100'
            }`}
        >
          <span className="text-xl">←</span>
          Back to Rooms
        </button>

        {/* Room Details Card */}
        <div className={`rounded-[32px] border overflow-hidden shadow-2xl transition-all duration-500 ${isDarkMode
          ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-xl'
          : 'bg-white border-gray-100'
          }`}>
          {/* Image Section */}
          {room.images && room.images.length > 0 && room.images[0] && room.images[0].trim() !== '' ? (
            <div className="relative h-60 group overflow-hidden">
              <img
                src={room.images[0]}
                alt={room.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-[#0f172a] via-transparent' : 'from-black/60 via-transparent'} to-transparent opacity-60`}></div>
              <button
                onClick={() => setShowGalleryModal(true)}
                className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-xl transition-all duration-300 flex items-center gap-3 border border-white/30 font-black uppercase text-xs tracking-widest"
              >
                <span>🖼️</span>
                View All Photos ({room.images.length})
              </button>
            </div>
          ) : (
            <div className={`h-60 ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-500 to-teal-600'}`}>
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-center">
                  <div className="w-32 h-32 bg-white/20 rounded-[32px] mx-auto mb-6 flex items-center justify-center text-5xl backdrop-blur-md">📷</div>
                  <p className="text-2xl font-black italic">Portrait Missing</p>
                </div>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${room.available
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                    ● {room.available ? 'Immediate Housing' : 'Occupied'}
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-gray-700/50 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {room.type}
                  </span>
                </div>
                <h1 className={`text-xl md:text-2xl font-black italic mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {room.title}
                </h1>
                <p className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="text-2xl">📍</span> {room.location}
                </p>
              </div>

              <div className="flex flex-col items-end text-right">
                <div className={`text-2xl font-black mb-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  NPR {room.price.toLocaleString()}
                </div>
                <div className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Monthly Commitment
                </div>
                <div className={`mt-1 flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-yellow-50 border-yellow-100'
                  }`}>
                  <span className="text-xl">⭐</span>
                  <span className={`font-black ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{room.rating}</span>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>(24 reviews)</span>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Bedrooms', val: room.beds, icon: '🛏️' },
                { label: 'Bathrooms', val: room.baths, icon: '🚿' },
                { label: 'Surface Area', val: `${room.sqft} sqft`, icon: '📐' },
                { label: 'Property Type', val: room.type, icon: '🏠' }
              ].map((feat, i) => (
                <div key={i} className={`p-4 rounded-[20px] border transition-all duration-300 hover:-translate-y-1 ${isDarkMode ? 'bg-gray-800/30 border-gray-700 hover:border-emerald-500/30' : 'bg-gray-50 border-gray-100 hover:border-emerald-200 shadow-sm'
                  }`}>
                  <div className="text-3xl mb-4">{feat.icon}</div>
                  <div className={`text-base font-black italic mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feat.val}</div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{feat.label}</div>
                </div>
              ))}
            </div>

            {/* Grid Layout for Details */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <section>
                  <h2 className={`text-xl font-black italic mb-3 flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    The Narrative
                    <div className="flex-1 h-px bg-current opacity-10"></div>
                  </h2>
                  <p className={`text-base leading-relaxed font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {room.description}
                  </p>
                </section>

                {/* Amenities */}
                <section>
                  <h2 className={`text-lg font-black italic mb-2 flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Key Features
                    <div className="flex-1 h-px bg-current opacity-10"></div>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {room.amenities.map((amenity, index) => (
                      <div key={index} className={`flex items-center gap-2 p-2 rounded-xl border ${isDarkMode ? 'bg-gray-800/20 border-gray-700' : 'bg-gray-50 border-gray-100'
                        }`}>
                        <span className="text-emerald-500">✓</span>
                        <span className={`text-sm font-black italic ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Location Map */}
                <section>
                  <h2 className={`text-lg font-black italic mb-2 flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Neighborhood Experience
                    <div className="flex-1 h-px bg-current opacity-10"></div>
                  </h2>
                  <div className={`rounded-2xl overflow-hidden border p-2 shadow-xl ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'
                    }`}>
                    <p className={`text-xs font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span>📍</span> {room.location}
                    </p>
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
                      height="300px"
                      center={[room.lat || 27.7172, room.lng || 85.3240]}
                      zoom={15}
                      showPopups={true}
                    />
                  </div>
                </section>
              </div>

              {/* Sidebar with Host & Action */}
              <div className="space-y-4">
                {/* Landlord Information */}
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>YOUR LANDLORD</h3>
                  <div className="flex items-center justify-between">
                    {/* Avatar with green background */}
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                      {room.landlord.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>

                    <div className="text-right ml-4">
                      {/* Landlord name */}
                      <h4 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {room.landlord}
                      </h4>

                      {/* Phone number */}
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {room.contactInfo}
                      </p>

                      {/* Message button */}
                      <button
                        onClick={() => setShowContactModal(true)}
                        className="px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-medium rounded-lg transition-colors duration-200"
                      >
                        MESSAGE
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-[20px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-500 text-base"
                  >
                    Apply to Book
                  </button>
                  <button
                    onClick={() => setShowContactModal(true)}
                    className={`w-full py-4 rounded-[20px] font-black uppercase tracking-widest transition-all duration-500 border-2 ${isDarkMode
                      ? 'bg-transparent border-gray-700 text-white hover:bg-gray-800'
                      : 'bg-white border-emerald-100 text-gray-900 hover:bg-emerald-50 shadow-sm'
                      }`}
                  >
                    Send Inquiry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showGalleryModal && room && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4 transition-all duration-500">
          <div className={`rounded-[40px] p-8 w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl relative border ${isDarkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <button
              onClick={() => setShowGalleryModal(false)}
              className={`absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-2xl font-black text-2xl transition-all duration-300 z-10 ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-400 hover:text-gray-900 shadow-sm'
                }`}
            >
              ×
            </button>
            <h3 className={`text-3xl font-black italic mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Visual Index
            </h3>

            <div className="overflow-y-auto max-h-[70vh] no-scrollbar pb-8">
              {room.images && room.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {room.images.map((image, index) => (
                    <div key={index} className="relative group rounded-[32px] overflow-hidden border border-transparent hover:border-emerald-500/50 transition-all duration-500">
                      <img
                        src={image}
                        alt={`${room.title} - Photo ${index + 1}`}
                        className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/20">
                        Image {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <div className={`w-40 h-40 rounded-[32px] mx-auto mb-8 flex items-center justify-center text-6xl ${isDarkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-300'
                    }`}>📷</div>
                  <p className={`text-xl font-black italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No photographic evidence</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Landlord Modal */}
      {showContactModal && room && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-center z-[80] p-4">
          <div className={`rounded-[40px] p-10 w-full max-w-lg shadow-2xl relative border ${isDarkMode ? 'bg-gray-900/40 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <button
              onClick={() => setShowContactModal(false)}
              className={`absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl font-black text-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-gray-500 hover:text-white' : 'bg-gray-100 text-gray-400 hover:text-gray-900 shadow-sm'
                }`}
            >
              ×
            </button>
            <h3 className={`text-3xl font-black italic mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Direct Inquiry</h3>
            <p className={`text-sm font-bold mb-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Brief the host regarding <span className="text-emerald-500 italic">{room.title}</span>
            </p>

            <form onSubmit={handleSendMessage} className="space-y-6">
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Topic of Interest</label>
                <input
                  type="text"
                  required
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="I am interested in..."
                  className={`w-full px-6 py-4 rounded-2xl font-bold transition-all duration-300 border focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 shadow-sm'
                    }`}
                />
              </div>
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Communication Content</label>
                <textarea
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Hello, I would like to know if..."
                  className={`w-full px-6 py-4 rounded-2xl font-bold transition-all duration-300 border focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 shadow-sm'
                    }`}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSendingMessage}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/40 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all duration-500 shadow-xl"
              >
                {isSendingMessage ? 'Transmitting...' : 'Dispatch Message'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && room && (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-2xl flex items-center justify-center z-[90] p-4">
          <div className={`rounded-[48px] p-12 max-w-xl w-full border shadow-2xl relative ${isDarkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <button
              onClick={() => setShowBookingModal(false)}
              className={`absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-2xl font-black text-2xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-gray-500 hover:text-white' : 'bg-gray-100 text-gray-400 hover:text-gray-900 shadow-sm'
                }`}
            >
              ×
            </button>

            <div className="mb-10 text-center">
              <h3 className={`text-4xl font-black italic mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reservation Protocol</h3>
              <div className={`inline-block p-6 rounded-[32px] border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-emerald-50 border-emerald-100 shadow-sm'
                }`}>
                <h4 className="font-black italic text-emerald-500 text-xl mb-1">{room.title}</h4>
                <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-emerald-700'}`}>{room.location}</p>
                <div className="space-y-3">
                  {(() => {
                    const months = calculateMonths(bookingDuration);
                    return months > 1 && (
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} animate-pulse`}>
                        {bookingDuration} days · {months} month{months > 1 ? 's' : ''}
                      </div>
                    );
                  })()}
                  <div className={`relative`}>
                    <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-all duration-500 ${totalPrice > room.price ? 'text-emerald-500 scale-110' : ''
                      }`}>
                      NPR {totalPrice.toLocaleString()}
                    </div>
                    {totalPrice > room.price && (
                      <div className={`absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce`}>
                        +{calculateMonths(bookingDuration) - 1}mo
                      </div>
                    )}
                  </div>
                  {totalPrice > room.price && (
                    <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} bg-gradient-to-r ${isDarkMode ? 'from-emerald-900/20 to-teal-900/20' : 'from-emerald-50 to-teal-50'
                      } px-3 py-1 rounded-full inline-block`}>
                      Total for {calculateMonths(bookingDuration)} month{calculateMonths(bookingDuration) > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleBookRoom} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Arrival Cycle</label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className={`w-full px-6 py-4 rounded-2xl font-bold border outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white color-scheme-dark' : 'bg-gray-50 border-gray-200 shadow-sm'
                      }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Departure Cycle</label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className={`w-full px-6 py-4 rounded-2xl font-bold border outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white color-scheme-dark' : 'bg-gray-50 border-gray-200 shadow-sm'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Custom Requirements</label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Specify any stay preferences..."
                  className={`w-full px-6 py-4 rounded-2xl font-bold border outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 shadow-sm'
                    }`}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black uppercase tracking-widest py-6 rounded-3xl transition-all duration-500 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 text-xl"
              >
                Confirm Intent
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetailPage;


