import { useState, useEffect } from 'react';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  type: 'apartment' | 'house' | 'studio' | 'room';
  bedrooms: number;
  bathrooms: number;
  area: number;
  landlord: string;
  landlordEmail: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  images: string[];
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending' | 'suspended'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'apartment' | 'house' | 'studio' | 'room'>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockProperties: Property[] = [
      {
        id: '1',
        title: 'Modern Studio Apartment',
        description: 'Beautiful studio apartment in the heart of the city with modern amenities',
        location: 'Kathmandu, Thamel',
        price: 15000,
        type: 'studio',
        bedrooms: 0,
        bathrooms: 1,
        area: 350,
        landlord: 'John Doe',
        landlordEmail: 'john@example.com',
        status: 'active',
        images: ['image1.jpg', 'image2.jpg'],
        amenities: ['WiFi', 'Parking', 'AC', 'Gym'],
        createdAt: '2024-01-15',
        updatedAt: '2024-03-10'
      },
      {
        id: '2',
        title: '2BHK Family Apartment',
        description: 'Spacious 2 bedroom apartment perfect for families',
        location: 'Pokhara, Lakeside',
        price: 25000,
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 2,
        area: 800,
        landlord: 'Jane Smith',
        landlordEmail: 'jane@example.com',
        status: 'active',
        images: ['image3.jpg', 'image4.jpg'],
        amenities: ['WiFi', 'Parking', 'Balcony', 'Kitchen'],
        createdAt: '2024-02-01',
        updatedAt: '2024-03-12'
      },
      {
        id: '3',
        title: 'Single Room for Rent',
        description: 'Affordable single room with shared facilities',
        location: 'Lalitpur, Jawalakhel',
        price: 8000,
        type: 'room',
        bedrooms: 1,
        bathrooms: 1,
        area: 150,
        landlord: 'Mike Johnson',
        landlordEmail: 'mike@example.com',
        status: 'pending',
        images: ['image5.jpg'],
        amenities: ['WiFi', 'Shared Kitchen'],
        createdAt: '2024-03-01',
        updatedAt: '2024-03-15'
      },
      {
        id: '4',
        title: 'Luxury Villa',
        description: 'Premium villa with private garden and pool',
        location: 'Bhaktapur',
        price: 50000,
        type: 'house',
        bedrooms: 4,
        bathrooms: 3,
        area: 2000,
        landlord: 'Sarah Wilson',
        landlordEmail: 'sarah@example.com',
        status: 'inactive',
        images: ['image6.jpg', 'image7.jpg', 'image8.jpg'],
        amenities: ['WiFi', 'Parking', 'Pool', 'Garden', 'Gym', 'Security'],
        createdAt: '2024-01-20',
        updatedAt: '2024-03-05'
      }
    ];

    setTimeout(() => {
      setProperties(mockProperties);
      setFilteredProperties(mockProperties);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter properties
  useEffect(() => {
    let filtered = properties;

    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.landlord.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => property.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(property => property.type === typeFilter);
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: Property['type']) => {
    switch (type) {
      case 'apartment':
        return '🏢';
      case 'house':
        return '🏠';
      case 'studio':
        return '🏘️';
      case 'room':
        return '🚪';
      default:
        return '🏠';
    }
  };

  const handleStatusChange = (propertyId: string, newStatus: Property['status']) => {
    setProperties(prev => prev.map(property =>
      property.id === propertyId
        ? { ...property, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
        : property
    ));
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      setProperties(prev => prev.filter(property => property.id !== propertyId));
    }
  };

  const viewPropertyDetails = (property: Property) => {
    setSelectedProperty(property);
    setIsViewModalOpen(true);
  };

  const stats = {
    total: properties.length,
    active: properties.filter(p => p.status === 'active').length,
    pending: properties.filter(p => p.status === 'pending').length,
    inactive: properties.filter(p => p.status === 'inactive').length,
    suspended: properties.filter(p => p.status === 'suspended').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Properties</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          <div className="text-sm text-gray-600">Inactive</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
          <div className="text-sm text-gray-600">Suspended</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by title, location, or landlord..."
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
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="studio">Studio</option>
            <option value="room">Room</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Landlord</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{getTypeIcon(property.type)}</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">{property.type} • {property.bedrooms} bed • {property.bathrooms} bath</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{property.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">NPR {property.price.toLocaleString()}/mo</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.landlord}</div>
                    <div className="text-sm text-gray-500">{property.landlordEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => viewPropertyDetails(property)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    {property.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(property.id, 'active')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                    )}
                    {property.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(property.id, 'suspended')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProperty(property.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProperties.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No properties found matching your criteria.
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {isViewModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProperty.title}</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full border ${getStatusColor(selectedProperty.status)}`}>
                  {selectedProperty.status}
                </span>
                <span className="text-gray-600">{selectedProperty.type}</span>
              </div>
              
              <p className="text-gray-700">{selectedProperty.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Location</h4>
                  <p className="text-gray-600">{selectedProperty.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Price</h4>
                  <p className="text-gray-600">NPR {selectedProperty.price.toLocaleString()}/month</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Size</h4>
                  <p className="text-gray-600">{selectedProperty.area} sq ft</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Rooms</h4>
                  <p className="text-gray-600">{selectedProperty.bedrooms} bed, {selectedProperty.bathrooms} bath</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Landlord</h4>
                <p className="text-gray-600">{selectedProperty.landlord}</p>
                <p className="text-gray-600">{selectedProperty.landlordEmail}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.amenities.map((amenity, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>Created: {selectedProperty.createdAt}</div>
                <div>Updated: {selectedProperty.updatedAt}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;