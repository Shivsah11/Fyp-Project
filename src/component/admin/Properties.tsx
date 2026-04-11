import { useState, useEffect } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

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
  const { isDarkMode } = useDarkMode();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending' | 'suspended'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'apartment' | 'house' | 'studio' | 'room'>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch properties from backend
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching admin properties from backend...');
      
      // Temporarily remove token requirement for testing
      const token = localStorage.getItem('token');
      console.log('📋 Token available:', !!token);
      
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      // Only add authorization if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/properties', {
        headers: headers,
      });

      console.log('📡 Backend response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin properties response:', data);
        const properties = data.properties || [];
        console.log('📊 Properties count:', properties.length);
        
        if (properties.length > 0) {
          console.log('🏠 Sample property:', properties[0]);
        }

        // Transform properties to match the interface
        const transformedProperties = properties.map((property: any) => ({
          id: property.id || property._id,
          title: property.title || 'Untitled Property',
          description: property.description || 'No description available',
          location: property.location || 'Location not specified',
          price: typeof property.price === 'string' ? parseFloat(property.price.replace(/[^0-9.]/g, '')) || 0 : property.price || 0,
          type: property.type || 'apartment',
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          area: property.area || 0,
          landlord: property.landlord || 'Unknown Landlord',
          landlordEmail: property.landlordEmail || 'No email provided',
          status: property.status || 'pending',
          images: property.images && property.images.length > 0 ? property.images : ['/api/placeholder/400/300'],
          amenities: property.amenities || ['WiFi', 'Parking'],
          createdAt: property.createdAt || new Date().toISOString(),
          updatedAt: property.updatedAt || new Date().toISOString()
        }));

        console.log('🔄 Transformed properties:', transformedProperties);
        setProperties(transformedProperties);
        setFilteredProperties(transformedProperties);
        
        console.log('✅ Successfully loaded', transformedProperties.length, 'properties from backend');
      } else {
        console.error('❌ Backend response not OK:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        // Try to get properties from localStorage as fallback
        console.log('🔄 Checking localStorage for properties...');
        const allProperties = localStorage.getItem('allProperties');
        if (allProperties) {
          try {
            const properties = JSON.parse(allProperties);
            console.log('📦 Properties from localStorage:', properties);
            
            const transformedProperties = properties.map((property: any) => ({
              id: property._id || property.id,
              title: property.title || property.propertyName || 'Untitled Property',
              description: property.description || `${property.title || property.propertyName} - ${property.type || 'Property'} in ${property.location || 'Location'}`,
              location: property.location || 'Location not specified',
              price: property.price || 0,
              type: property.type || 'apartment',
              bedrooms: property.beds || property.bedrooms || 0,
              bathrooms: property.baths || property.bathrooms || 0,
              area: property.area || 0,
              landlord: property.landlordName || property.landlord || 'Unknown Landlord',
              landlordEmail: property.landlordEmail || 'No email provided',
              status: property.status || 'pending',
              images: property.image ? [property.image] : ['/api/placeholder/400/300'],
              amenities: property.amenities || ['WiFi', 'Parking'],
              createdAt: property.createdAt || new Date().toISOString(),
              updatedAt: property.updatedAt || new Date().toISOString()
            }));
            
            setProperties(transformedProperties);
            setFilteredProperties(transformedProperties);
            console.log('✅ Loaded', transformedProperties.length, 'properties from localStorage');
          } catch (parseError) {
            console.error('❌ Error parsing localStorage properties:', parseError);
            setProperties([]);
            setFilteredProperties([]);
          }
        } else {
          console.log('⚠️ No properties found in localStorage');
          setProperties([]);
          setFilteredProperties([]);
        }
      }
    } catch (error) {
      console.error('❌ Fetch properties error:', error);
      
      // Try localStorage as last resort
      const allProperties = localStorage.getItem('allProperties');
      if (allProperties) {
        try {
          const properties = JSON.parse(allProperties);
          const transformedProperties = properties.map((property: any) => ({
            id: property._id || property.id,
            title: property.title || property.propertyName || 'Untitled Property',
            description: property.description || `${property.title || property.propertyName} - ${property.type || 'Property'} in ${property.location || 'Location'}`,
            location: property.location || 'Location not specified',
            price: property.price || 0,
            type: property.type || 'apartment',
            bedrooms: property.beds || property.bedrooms || 0,
            bathrooms: property.baths || property.bathrooms || 0,
            area: property.area || 0,
            landlord: property.landlordName || property.landlord || 'Unknown Landlord',
            landlordEmail: property.landlordEmail || 'No email provided',
            status: property.status || 'pending',
            images: property.image ? [property.image] : ['/api/placeholder/400/300'],
            amenities: property.amenities || ['WiFi', 'Parking'],
            createdAt: property.createdAt || new Date().toISOString(),
            updatedAt: property.updatedAt || new Date().toISOString()
          }));
          
          setProperties(transformedProperties);
          setFilteredProperties(transformedProperties);
          console.log('✅ Loaded', transformedProperties.length, 'properties from localStorage (fallback)');
        } catch (parseError) {
          console.error('❌ Error parsing localStorage properties:', parseError);
          setProperties([]);
          setFilteredProperties([]);
        }
      } else {
        console.log('⚠️ No properties found anywhere');
        setProperties([]);
        setFilteredProperties([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        return isDarkMode 
          ? 'bg-green-900/30 text-green-400 border-green-700'
          : 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return isDarkMode 
          ? 'bg-gray-900/30 text-gray-400 border-gray-700'
          : 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return isDarkMode 
          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700'
          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return isDarkMode 
          ? 'bg-red-900/30 text-red-400 border-red-700'
          : 'bg-red-100 text-red-800 border-red-200';
      default:
        return isDarkMode 
          ? 'bg-gray-900/30 text-gray-400 border-gray-700'
          : 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleStatusChange = async (propertyId: string, newStatus: Property['status']) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/properties/${propertyId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchProperties();
      } else {
        alert('Failed to update property status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      alert('Server error');
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/properties/${propertyId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          await fetchProperties();
        } else {
          alert('Failed to delete property');
        }
      } catch (error) {
        console.error('Delete property error:', error);
        alert('Server error');
      }
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
          <p className={`text-gray-600 ${isDarkMode ? 'dark:text-gray-400' : ''}`}>Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="flex gap-4">
        <div className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
          <div className="h-1 bg-blue-500 w-full"></div>
          <div className="px-5 py-6 flex flex-col gap-1">
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Total Properties</div>
          </div>
        </div>
        <div className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
          <div className="h-1 bg-green-500 w-full"></div>
          <div className="px-5 py-6 flex flex-col gap-1">
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{stats.active}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Active</div>
          </div>
        </div>
        <div className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
          <div className="h-1 bg-yellow-500 w-full"></div>
          <div className="px-5 py-6 flex flex-col gap-1">
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.pending}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Pending</div>
          </div>
        </div>
        <div className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
          <div className="h-1 bg-gray-400 w-full"></div>
          <div className="px-5 py-6 flex flex-col gap-1">
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stats.inactive}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Inactive</div>
          </div>
        </div>
        <div className={`flex-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
          <div className="h-1 bg-red-500 w-full"></div>
          <div className="px-5 py-6 flex flex-col gap-1">
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{stats.suspended}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Suspended</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-4 border`}>
        <div className="flex gap-4 mb-3">
          <input
            type="text"
            placeholder="Search by title, location, or landlord..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'}`}
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
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="studio">Studio</option>
            <option value="room">Room</option>
          </select>
        </div>
        <div className="flex justify-center mt-2">
          <button
            style={{ backgroundColor: '#2563eb', color: '#ffffff', border: '1px solid #1d4ed8' }}
            className="px-8 py-2.5 rounded-lg text-sm font-semibold shadow hover:opacity-90 transition-opacity"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Properties Table */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Property</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Landlord</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {filteredProperties.map((property) => (
                <tr key={property.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{getTypeIcon(property.type)}</div>
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{property.title}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{property.type} • {property.bedrooms} bed • {property.bathrooms} bath</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{property.location}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NPR {property.price.toLocaleString()}/mo</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{property.landlord}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{property.landlordEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => viewPropertyDetails(property)}
                      className={`text-blue-600 hover:text-blue-900 ${isDarkMode ? 'dark:text-blue-400 hover:dark:text-blue-300' : ''}`}
                    >
                      View
                    </button>
                    {property.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(property.id, 'active')}
                        className={`text-green-600 hover:text-green-900 ${isDarkMode ? 'dark:text-green-400 hover:dark:text-green-300' : ''}`}
                      >
                        Approve
                      </button>
                    )}
                    {property.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(property.id, 'suspended')}
                        className={`text-yellow-600 hover:text-yellow-900 ${isDarkMode ? 'dark:text-yellow-400 hover:dark:text-yellow-300' : ''}`}
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProperty(property.id)}
                      className={`text-red-600 hover:text-red-900 ${isDarkMode ? 'dark:text-red-400 hover:dark:text-red-300' : ''}`}
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
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No properties found matching your criteria.
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {isViewModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-start mb-6">
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProperty.title}</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className={`text-2xl font-bold ${isDarkMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                ×
              </button>
            </div>

            {/* Property Image */}
            <div className="mb-6">
              <div className={`w-full h-64 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl overflow-hidden`}>
                <img 
                  src={selectedProperty.images[0] || '/api/placeholder/600/400'} 
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/api/placeholder/600/400';
                  }}
                />
              </div>
            </div>

            {/* Status and Type */}
            <div className="flex items-center gap-4 mb-6">
              <span className={`px-4 py-2 rounded-full border ${getStatusColor(selectedProperty.status)}`}>
                {selectedProperty.status.charAt(0).toUpperCase() + selectedProperty.status.slice(1)}
              </span>
              <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {getTypeIcon(selectedProperty.type)} {selectedProperty.type.charAt(0).toUpperCase() + selectedProperty.type.slice(1)}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Description</h3>
              <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedProperty.description}</p>
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Basic Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Location:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProperty.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Price:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NPR {selectedProperty.price.toLocaleString()}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Size:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProperty.area} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Bedrooms:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProperty.bedrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Bathrooms:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProperty.bathrooms}</span>
                  </div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Landlord Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Name:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProperty.landlord}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Email:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProperty.landlordEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProperty.amenities.map((amenity, index) => (
                  <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium ${isDarkMode 
                    ? 'bg-blue-900/30 text-blue-400' 
                    : 'bg-blue-100 text-blue-800'}`}>
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Timestamps */}
            <div className={`grid grid-cols-2 gap-4 text-sm pt-4 ${isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'} border-t`}>
              <div>
                <span className="font-medium">Created:</span> {selectedProperty.createdAt}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {selectedProperty.updatedAt}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;