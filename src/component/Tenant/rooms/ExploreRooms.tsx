import { useState } from 'react';

interface Room {
  id: number;
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
}

const ExploreRooms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Mock room data
  const rooms: Room[] = [
    {
      id: 1,
      title: "Modern Studio Apartment",
      type: "Studio",
      price: 850,
      location: "Downtown District",
      beds: 1,
      baths: 1,
      sqft: 450,
      available: true,
      rating: 4.5,
      images: ["room1.jpg"],
      amenities: ["WiFi", "Kitchen", "Parking", "Gym"],
      description: "Beautiful modern studio in the heart of downtown with amazing city views.",
      landlord: "John Smith",
      contactInfo: "john.smith@email.com"
    },
    {
      id: 2,
      title: "Cozy 2BR Near University",
      type: "2 Bedroom",
      price: 1200,
      location: "University Area",
      beds: 2,
      baths: 1,
      sqft: 750,
      available: true,
      rating: 4.8,
      images: ["room2.jpg"],
      amenities: ["WiFi", "Laundry", "Study Room", "Security"],
      description: "Perfect for students - close to campus with great study facilities.",
      landlord: "Sarah Johnson",
      contactInfo: "sarah.j@email.com"
    },
    {
      id: 3,
      title: "Luxury 3BR Penthouse",
      type: "3 Bedroom",
      price: 2500,
      location: "Riverside",
      beds: 3,
      baths: 2,
      sqft: 1200,
      available: false,
      rating: 4.9,
      images: ["room3.jpg"],
      amenities: ["WiFi", "Pool", "Gym", "Concierge", "Parking", "Balcony"],
      description: "Stunning penthouse with panoramic river views and luxury amenities.",
      landlord: "Michael Chen",
      contactInfo: "m.chen@luxuryrentals.com"
    },
    {
      id: 4,
      title: "Affordable 1BR Apartment",
      type: "1 Bedroom",
      price: 650,
      location: "Suburban Area",
      beds: 1,
      baths: 1,
      sqft: 550,
      available: true,
      rating: 4.2,
      images: ["room4.jpg"],
      amenities: ["WiFi", "Parking", "Laundry"],
      description: "Budget-friendly option with all essential amenities.",
      landlord: "Emily Davis",
      contactInfo: "emily.davis@email.com"
    },
    {
      id: 5,
      title: "Spacious 2BR with Garden",
      type: "2 Bedroom",
      price: 1400,
      location: "Green Valley",
      beds: 2,
      baths: 2,
      sqft: 900,
      available: true,
      rating: 4.6,
      images: ["room5.jpg"],
      amenities: ["WiFi", "Garden", "Parking", "Storage", "Pet Friendly"],
      description: "Beautiful apartment with private garden access, perfect for nature lovers.",
      landlord: "Robert Wilson",
      contactInfo: "r.wilson@greenhomes.com"
    },
    {
      id: 6,
      title: "Student Studio Complex",
      type: "Studio",
      price: 550,
      location: "Student Village",
      beds: 1,
      baths: 1,
      sqft: 350,
      available: true,
      rating: 4.0,
      images: ["room6.jpg"],
      amenities: ["WiFi", "Study Lounge", "Gym", "Security", "Bus Stop"],
      description: "Affordable student housing with excellent facilities.",
      landlord: "Campus Housing",
      contactInfo: "housing@university.edu"
    }
  ];

  const roomTypes = ['all', 'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom'];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || room.type === selectedType;
    const matchesPrice = room.price >= priceRange.min && room.price <= priceRange.max;
    
    return matchesSearch && matchesType && matchesPrice;
  });

  const RoomCard = ({ room }: { room: Room }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.02]">
      <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <div className="text-white/80 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-2"></div>
          <p className="text-sm">Room Image</p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-800 font-semibold text-lg">{room.title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            room.available 
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
            <span className="text-2xl font-bold text-gray-800">${room.price}</span>
            <span className="text-gray-500 text-sm">/month</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-gray-700 text-sm">{room.rating}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {room.amenities.slice(0, 3).map((amenity, index) => (
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
        
        <button 
          onClick={() => setSelectedRoom(room)}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-blue-400"
        >
          View Details
        </button>
      </div>
    </div>
  );

  const RoomDetailModal = () => {
    if (!selectedRoom) return null;

    return (
      <div className="fixed inset-0 bg-gray-100/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="relative h-64 bg-blue-500">
            <button
              onClick={() => setSelectedRoom(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl"
            >
              ×
            </button>
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-center">
                <div className="w-24 h-24 bg-white rounded-xl mx-auto mb-2"></div>
                <p className="text-lg">Room Gallery</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedRoom.title}</h2>
                <p className="text-gray-600 flex items-center gap-2">
                  📍 {selectedRoom.location}
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedRoom.available 
                      ? 'bg-green-200 text-green-600 border-green-300' 
                      : 'bg-red-200 text-red-600 border-red-300'
                  }`}>
                    {selectedRoom.available ? 'Available' : 'Occupied'}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">${selectedRoom.price}</div>
                <div className="text-gray-600">/month</div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-gray-900">{selectedRoom.rating} (24 reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🛏️</div>
                <div className="text-gray-900 font-semibold">{selectedRoom.beds}</div>
                <div className="text-gray-600 text-sm">Bedrooms</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🚿</div>
                <div className="text-gray-900 font-semibold">{selectedRoom.baths}</div>
                <div className="text-gray-600 text-sm">Bathrooms</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">📐</div>
                <div className="text-gray-900 font-semibold">{selectedRoom.sqft}</div>
                <div className="text-gray-600 text-sm">Sq Ft</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🏠</div>
                <div className="text-gray-900 font-semibold">{selectedRoom.type}</div>
                <div className="text-gray-600 text-sm">Type</div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{selectedRoom.description}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Amenities</h3>
              <div className="grid grid-cols-3 gap-3">
                {selectedRoom.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-600">
                    <span className="text-green-400">✓</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Landlord Information</h3>
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-gray-900 font-semibold mb-1">{selectedRoom.landlord}</p>
                <p className="text-gray-500 text-sm">📧 {selectedRoom.contactInfo}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300">
                Schedule Tour
              </button>
              <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-all duration-300 border border-white/20">
                Contact Landlord
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Explore Rooms</h2>
        <p className="text-gray-600">Find your perfect living space from our curated selection</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by location or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            {roomTypes.map(type => (
              <option key={type} value={type} className="bg-gray-800">
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
          
          <input
            type="number"
            placeholder="Min Price"
            value={priceRange.min}
            onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
            className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
          
          <input
            type="number"
            placeholder="Max Price"
            value={priceRange.max}
            onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
            className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Found <span className="text-gray-800 font-semibold">{filteredRooms.length}</span> rooms
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-200 transition-all duration-300">
              Sort by Price
            </button>
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-200 transition-all duration-300">
              Sort by Rating
            </button>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-2 gap-6">
        {filteredRooms.map(room => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No rooms found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Room Detail Modal */}
      <RoomDetailModal />
    </div>
  );
};

export default ExploreRooms;
