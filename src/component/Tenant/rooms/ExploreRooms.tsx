import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../../context/DarkModeContext';
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

const ExploreRooms = () => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'none'>('none');


  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, _setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/properties', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        let result;
        if (response.ok) {
          result = await response.json();
        } else {
          console.warn('API fetch failed, using fallback data');
        }

        if (result && result.success && result.data && result.data.length > 0) {
          const mappedRooms = result.data.map((p: any) => ({
            id: p._id,
            title: p.title,
            type: p.type === 'apartment' ? 'Apartment' :
              p.type === 'house' ? 'House' :
                p.type === 'studio' ? 'Studio' :
                  p.type === 'room' ? '1 Bedroom' : p.type,
            price: Number(typeof p.price === 'string' ? p.price.replace(/[^0-9]/g, '') : p.price) || 0,
            location: p.location,
            beds: p.beds || 0,
            baths: p.baths || 0,
            sqft: p.area || 0,
            available: p.status === 'Available' || p.status === 'active',
            rating: p.rating || 4.5,
            images: p.image ? [p.image] : [],
            amenities: p.amenities || [],
            description: p.description || '',
            landlordId: p.landlordId ? (typeof p.landlordId === 'object' ? p.landlordId._id : p.landlordId) : '',
            landlord: p.landlordId && typeof p.landlordId === 'object' ? `${p.landlordId.firstName} ${p.landlordId.lastName}` : 'System Landlord',
            contactInfo: p.landlordId && typeof p.landlordId === 'object' ? p.landlordId.email : 'contact@renthub.com',
            lat: p.lat || 27.7172 + (Math.random() - 0.5) * 0.1,
            lng: p.lng || 85.3240 + (Math.random() - 0.5) * 0.1
          }));
          setRooms(mappedRooms);
        } else {
          // Provide high-quality fallback data if backend is empty
          const fallbackRooms: Room[] = [
            {
              id: 101,
              title: "Modern Executive Studio",
              type: "Studio",
              price: 15000,
              location: "New Baneshwor, Kathmandu",
              beds: 1,
              baths: 1,
              sqft: 450,
              available: true,
              rating: 4.8,
              images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"],
              amenities: ["WiFi", "Kitchen", "AC"],
              description: "Luxury studio in the heart of the city.",
              landlord: "John Doe",
              landlordId: "L1",
              contactInfo: "john@example.com"
            },
            {
              id: 102,
              title: "Cozy Family Apartment",
              type: "2 Bedroom",
              price: 35000,
              location: "Lalitpur, Nepal",
              beds: 2,
              baths: 2,
              sqft: 950,
              available: true,
              rating: 4.6,
              images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800"],
              amenities: ["Parking", "Balcony", "Security"],
              description: "Spacious family home with great views.",
              landlord: "Sarah Jenkins",
              landlordId: "L2",
              contactInfo: "sarah@example.com"
            },
            {
              id: 103,
              title: "Premium Penthouse Suite",
              type: "3 Bedroom",
              price: 85000,
              location: "Jhamsikhel, Lalitpur",
              beds: 3,
              baths: 3,
              sqft: 1800,
              available: true,
              rating: 4.9,
              images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800"],
              amenities: ["Gym", "Pool", "Smart Home"],
              description: "Ultra-luxury penthouse with panoramic city views.",
              landlord: "Robert Chen",
              landlordId: "L3",
              contactInfo: "robert@example.com"
            },
            {
              id: 104,
              title: "Zen Garden Studio",
              type: "Studio",
              price: 12000,
              location: "Patan, Nepal",
              beds: 1,
              baths: 1,
              sqft: 400,
              available: true,
              rating: 4.7,
              images: ["https://images.unsplash.com/photo-1484101403033-571067250931?auto=format&fit=crop&q=80&w=800"],
              amenities: ["Garden", "Quiet Area"],
              description: "Calm and peaceful living space.",
              landlord: "Anna Maria",
              landlordId: "L4",
              contactInfo: "anna@example.com"
            }
          ];
          setRooms(fallbackRooms);
        }
      } catch (err: any) {
        console.error("ExploreRooms Fetch Error:", err);
        setError(err.message || 'Connecting to server...');
        // Fallback data nonetheless to keep app usable
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const roomTypes = ['all', 'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom'];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || room.type === selectedType;
    const matchesPrice = room.price >= priceRange.min && room.price <= priceRange.max;

    return matchesSearch && matchesType && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const handleQuickBook = async (room: Room) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to book a room.');
        return;
      }

      // Create booking data for backend API
      const bookingPayload = {
        propertyId: room.id,
        checkInDate: new Date().toISOString().split('T')[0], // Today's date
        checkOutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        numberOfGuests: 1,
        specialRequests: 'Quick booking from Explore Rooms'
      };

      // Call backend API to create booking
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });

      const result = await response.json();

      if (result.success) {
        // Create user-specific storage key for temporary display
        const userId = JSON.parse(atob(token.split('.')[1])).userId;
        const newBookingKey = `newBooking_${userId}`;

        // Create display version of booking data for immediate UI update
        const displayBookingData = {
          id: result.data._id,
          propertyName: room.title,
          propertyType: room.type,
          location: room.location,
          checkIn: bookingPayload.checkInDate,
          checkOut: bookingPayload.checkOutDate,
          price: room.price,
          status: 'pending',
          paymentStatus: 'pending',
          image: room.images?.[0] || '',
          amenities: room.amenities || [],
          landlord: room.landlord,
          landlordId: room.landlordId,
          landlordContact: room.contactInfo
        };

        // Store temporary display data for immediate UI update (only if not already stored)
        const existingNewBooking = localStorage.getItem(newBookingKey);
        if (!existingNewBooking) {
          localStorage.setItem(newBookingKey, JSON.stringify(displayBookingData));

          // Trigger storage event for BookingsManagement component
          window.dispatchEvent(new StorageEvent('storage', {
            key: newBookingKey,
            newValue: JSON.stringify(displayBookingData)
          }));
        }

        alert('Room booked successfully! Your booking request has been sent to the landlord.');
      } else {
        alert(result.message || 'Failed to book room. Please try again.');
      }

    } catch (error) {
      console.error('Quick booking error:', error);

      // Fallback to localStorage if backend is unavailable
      const token = localStorage.getItem('token');
      if (token) {
        const userId = JSON.parse(atob(token.split('.')[1])).userId;
        const userBookingsKey = `userBookings_${userId}`;
        const newBookingKey = `newBooking_${userId}`;

        const bookingData = {
          id: Date.now().toString(),
          propertyName: room.title,
          propertyType: room.type,
          location: room.location,
          checkIn: new Date().toISOString().split('T')[0],
          checkOut: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          price: room.price,
          status: 'pending',
          paymentStatus: 'pending',
          image: room.images?.[0] || '',
          amenities: room.amenities || [],
          landlord: room.landlord,
          landlordId: room.landlordId,
          landlordContact: room.contactInfo
        };

        const existingBookings = JSON.parse(localStorage.getItem(userBookingsKey) || '[]');
        const existingBooking = existingBookings.find((b: any) =>
          b.propertyName === room.title || b.id === room.id
        );

        if (!existingBooking) {
          const updatedBookings = [bookingData, ...existingBookings];
          localStorage.setItem(userBookingsKey, JSON.stringify(updatedBookings));
          localStorage.setItem(newBookingKey, JSON.stringify(bookingData));

          window.dispatchEvent(new StorageEvent('storage', {
            key: newBookingKey,
            newValue: JSON.stringify(bookingData)
          }));

          alert('Room booked successfully! (Offline mode - will sync when online)');
        } else {
          alert('You have already booked this property! Check your bookings section.');
        }
      } else {
        alert('Failed to book room. Please try again.');
      }
    }
  };

  const RoomCard = ({ room }: { room: Room }) => (
    <div className={`group rounded-3xl border overflow-hidden transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl ${isDarkMode
      ? 'bg-gray-800 border-gray-700 hover:border-emerald-500/50'
      : 'bg-white border-gray-200 hover:border-emerald-400 shadow-sm'
      }`}>
      <div className="relative h-40 overflow-hidden">
        {room.images && room.images.length > 0 && room.images[0] && room.images[0].trim() !== '' ? (
          <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <div className="text-white/80 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl mx-auto mb-1 flex items-center justify-center text-xl font-black">?</div>
              <p className="text-[8px] font-black uppercase tracking-widest">No Image</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md border ${room.available
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
            {room.available ? 'Ready' : 'Occupied'}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-yellow-400 text-[10px]">⭐</span>
            <span className="text-white text-[8px] font-black">{room.rating}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <p className="text-emerald-500 text-[8px] font-black uppercase tracking-widest mb-0.5">{room.type}</p>
          <h3 className={`text-lg font-black italic truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{room.title}</h3>
          <p className={`text-[10px] font-bold truncate mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>📍 {room.location}</p>
        </div>

        <div className={`grid grid-cols-3 gap-1 py-3 border-y mb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="text-center">
            <p className={`text-[8px] font-black uppercase tracking-tighter ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Beds</p>
            <p className={`text-sm font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{room.beds}</p>
          </div>
          <div className="text-center">
            <p className={`text-[8px] font-black uppercase tracking-tighter ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Baths</p>
            <p className={`text-sm font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{room.baths}</p>
          </div>
          <div className="text-center">
            <p className={`text-[8px] font-black uppercase tracking-tighter ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Sqft</p>
            <p className={`text-sm font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{room.sqft}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Monthly</p>
            <p className={`text-xl font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NPR {room.price.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleQuickBook(room)}
            disabled={!room.available}
            className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-lg ${!room.available
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-500 text-white shadow-emerald-500/10 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0'
              }`}
          >
            Instant Book
          </button>
          <button
            onClick={() => navigate(`/tenant/room/${room.id}`)}
            className={`px-4 rounded-xl transition-all duration-300 border flex items-center justify-center ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
              : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
              }`}
          >
            <span className="text-lg">→</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`w-full h-full min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

      {/* Search and Filters Header */}
      <div className={`relative pt-8 pb-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className={`text-4xl font-black italic mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Explore Rooms</h1>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2rem] ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>Find your perfect stay in the city</p>
          </div>

          <div className={`p-4 rounded-[2rem] border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'
            }`}>
            {/* Top Row: Search, Type, Price - FORCED TO ONE ROW */}
            <div className="flex flex-row items-center gap-3 mb-6">
              <div className="flex-[2] relative">
                <input
                  type="text"
                  placeholder="Search location or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                />
              </div>

              <div className="flex-1 min-w-[140px]">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer focus:outline-none text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                >
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
                  ))}
                </select>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-gray-400 uppercase">MIN</span>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                    className="w-12 bg-transparent font-bold text-xs focus:outline-none"
                  />
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-gray-400 uppercase">MAX</span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 0 })}
                    className="w-16 bg-transparent font-bold text-xs focus:outline-none text-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Dash Separator */}
            <div className={`border-t border-dashed mb-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}></div>

            {/* Bottom Row: Sort and Results Count */}
            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">SORT BY</span>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSortBy(sortBy === 'price' ? 'none' : 'price')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all duration-300 text-xs font-bold ${sortBy === 'price'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400'
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${sortBy === 'price' ? 'bg-white' : 'bg-gray-300'}`}></div>
                    Price
                  </button>
                  <button
                    onClick={() => setSortBy(sortBy === 'rating' ? 'none' : 'rating')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all duration-300 text-xs font-bold ${sortBy === 'rating'
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400'
                      }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${sortBy === 'rating' ? 'bg-white' : 'bg-gray-300'}`}></div>
                    Rating
                  </button>
                </div>
              </div>

              <div className={`w-full max-w-lg flex items-center gap-4 px-6 py-4 rounded-2xl ${isDarkMode ? 'bg-blue-900/20 text-blue-400 border border-blue-800/30' : 'bg-blue-50/50 text-blue-600 border border-blue-100'
                }`}>
                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
                <span className="text-sm font-black">
                  Found {filteredRooms.length} Premium Rooms matching your selection
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="w-24 h-24 border-[6px] border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className={`font-black text-2xl uppercase tracking-[0.3em] ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>Curating Stays...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 grayscale h-20">📡</div>
            <h3 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Host Unavailable</h3>
            <p className={`font-bold italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{error}</p>
          </div>
        ) : viewMode === 'map' ? (
          <div className={`rounded-[2.5rem] overflow-hidden border shadow-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <PropertyMap
              properties={filteredRooms.map(room => ({
                id: room.id,
                title: room.title,
                type: room.type,
                price: room.price,
                location: room.location,
                lat: room.lat || 27.7172,
                lng: room.lng || 85.3240,
                available: room.available,
                rating: room.rating
              }))}
              height="600px"
              onPropertyClick={(property) => navigate(`/tenant/room/${property.id}`)}
              showPopups={true}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 lg:gap-8">
            {filteredRooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}

            {filteredRooms.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-32 rounded-[3.5rem] border border-dashed border-gray-300">
                <div className="text-7xl mb-8 grayscale h-24">🏘️</div>
                <h3 className={`text-4xl font-black italic mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Matches Found</h3>
                <p className={`text-lg font-bold italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Try expanding your luxury search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreRooms;
