import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 25000 });
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'none'>('none');


  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/properties', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
           throw new Error('Failed to fetch rooms');
        }

        const result = await response.json();
        
        if (result.success) {
          const mappedRooms = result.data.map((p: any) => ({
            id: p._id,
            title: p.title,
            type: p.type === 'apartment' ? 'Apartment' : 
                  p.type === 'house' ? 'House' : 
                  p.type === 'studio' ? 'Studio' : 
                  p.type === 'room' ? '1 Bedroom' : p.type,
            price: Number(typeof p.price === 'string' ? p.price.replace(/[^0-9]/g, '') : p.price),
            location: p.location,
            beds: p.beds || 0,
            baths: p.baths || 0,
            sqft: p.area || 0,
            available: p.status === 'Available' || p.status === 'active',
            rating: p.rating || 0,
            images: p.image ? [p.image] : [],
            amenities: p.amenities || [],
            description: p.description || '',
            landlordId: p.landlordId ? p.landlordId._id : '',
            landlord: p.landlordId ? `${p.landlordId.firstName} ${p.landlordId.lastName}` : 'Unknown Landlord',
            contactInfo: p.landlordId ? p.landlordId.email : '',
            // Add coordinates - for demo, use Kathmandu coordinates with some randomization
            lat: p.lat || 27.7172 + (Math.random() - 0.5) * 0.1,
            lng: p.lng || 85.3240 + (Math.random() - 0.5) * 0.1
          }));
          setRooms(mappedRooms);
        } else {
          setError(result.message || 'Server returned an unsuccessful response');
        }
      } catch (err: any) {
        console.error("Detailed Fetch Error:", err);
        setError(err.message || 'Error connecting to server. Please check your internet or if the backend is running on port 5000.');
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
      // Create booking data directly from room
      const bookingData = {
        id: Date.now().toString(),
        propertyId: room.id,
        propertyName: room.title,
        propertyType: room.type,
        location: room.location,
        checkIn: new Date().toISOString().split('T')[0], // Today's date
        checkOut: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        price: room.price,
        status: 'pending',
        paymentStatus: 'pending',
        image: room.images?.[0] || '',
        amenities: room.amenities || [],
        requestDate: new Date().toISOString(),
        specialRequests: '',
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

      alert('Room booked successfully! Check your bookings section.');
      
    } catch (error) {
      console.error('Quick booking error:', error);
      alert('Failed to book room. Please try again.');
    }
  };

  const RoomCard = ({ room }: { room: Room }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.02]">
      {room.images && room.images.length > 0 && room.images[0] && room.images[0].trim() !== '' ? (
        <img src={room.images[0]} alt={room.title} className="w-full h-32 object-cover" />
      ) : (
        <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <div className="text-white/80 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-2 flex items-center justify-center text-2xl">📷</div>
            <p className="text-sm">Room Image</p>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-800 font-semibold text-lg">{room.title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${room.available
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-red-100 text-red-800 border-red-200'
            }`}>
            {room.available ? 'Available' : 'Occupied'}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3">📍 {room.location}</p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span>🛏️ {room.beds} bed</span>
          <span>🚿 {room.baths} bath</span>
          <span>📐 {room.sqft} sqft</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-gray-800">NPR {room.price}</span>
            <span className="text-gray-500 text-sm">/month</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-gray-700 text-sm">{room.rating}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {room.amenities.slice(0, 3).map((amenity: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 border border-gray-300 text-gray-600 text-xs rounded-full">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleQuickBook(room)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-blue-400"
          >
            Book Now
          </button>
          <button
            onClick={() => navigate(`/tenant/room/${room.id}`)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors border border-gray-300"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full min-h-screen bg-gray-50 p-6">

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8 shadow-sm w-full max-w-7xl mx-auto">
        {/* Search Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Search location or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
            />
          </div>

          <div className="w-44">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
            >
              {roomTypes.map(type => (
                <option key={type} value={type} className="bg-white">
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 tracking-tight">MIN</span>
              <input
                type="number"
                placeholder="0"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                className="w-24 pl-8 pr-2 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm"
              />
            </div>
            <span className="text-gray-400 font-semibold">-</span>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 tracking-tight">MAX</span>
              <input
                type="number"
                placeholder="25000"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className="w-28 pl-8 pr-2 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Sort and Results Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">View</span>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg border font-medium transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg border font-medium transition-all duration-200 ${
                  viewMode === 'map' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Map
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Sort By</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy(sortBy === 'price' ? 'none' : 'price')}
                className={`px-4 py-2 rounded-lg border font-medium transition-all duration-200 ${
                  sortBy === 'price' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Price
              </button>
              <button
                onClick={() => setSortBy(sortBy === 'rating' ? 'none' : 'rating')}
                className={`px-4 py-2 rounded-lg border font-medium transition-all duration-200 ${
                  sortBy === 'rating' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Rating
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <p className="text-blue-700 text-sm font-medium">
              Found {filteredRooms.length} rooms
            </p>
          </div>
        </div>
      </div>

      {/* Room Grid or Map */}
      <div className="w-full max-w-7xl mx-auto">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-gray-500 font-bold text-xl animate-pulse">Fetching the finest rooms for you...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
           <div className="text-5xl mb-4">⚠️</div>
           <h3 className="text-2xl font-bold text-red-700 mb-2">Connection Issue</h3>
           <p className="text-red-600">{error}</p>
        </div>
      ) : viewMode === 'map' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Locations</h3>
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
              height="500px"
              onPropertyClick={(property) => navigate(`/tenant/room/${property.id}`)}
              showPopups={true}
            />
          </div>
          
          {/* Property list below map */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Properties ({filteredRooms.length})</h3>
            <div className="grid grid-cols-3 gap-4">
              {filteredRooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredRooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}

          {filteredRooms.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No rooms found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>
      )}
      </div>

    </div>
  );
};

export default ExploreRooms;
