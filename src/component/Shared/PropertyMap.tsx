import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useDarkMode } from '../../context/DarkModeContext';
import { Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Property {
  id: number;
  title: string;
  type: string;
  price: number;
  location: string;
  lat: number;
  lng: number;
  available: boolean;
  rating: number;
}

interface PropertyMapProps {
  properties: Property[];
  height?: string;
  onPropertyClick?: (property: Property) => void;
  center?: [number, number];
  zoom?: number;
  showPopups?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

// Component to fit map to all markers
const MapBounds: React.FC<{ properties: Property[] }> = ({ properties }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (properties.length > 0) {
      const bounds = new LatLngBounds(
        properties.map(p => [p.lat, p.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [properties, map]);

  return null;
};

// Component to handle map clicks
const MapClickHandler: React.FC<{ onMapClick?: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  height = '400px',
  onPropertyClick,
  center = [27.7172, 85.3240], // Default to Kathmandu
  zoom = 12,
  showPopups = true,
  onMapClick
}) => {
  const { isDarkMode } = useDarkMode();
  const [_selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Custom marker icon based on property status and price
  const getMarkerIcon = (property: Property) => {
    const isHighPrice = property.price > 20000;
    const color = property.available 
      ? (isHighPrice ? '#dc2626' : '#16a34a') // Red for expensive, green for affordable
      : '#6b7280'; // Gray for unavailable

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24c0-8.8-7.2-16-16-16z" fill="${color}"/>
          <circle cx="16" cy="16" r="8" fill="white"/>
          <text x="16" y="20" text-anchor="middle" fill="${color}" font-family="Arial" font-size="8" font-weight="bold">
            ${property.price >= 1000 ? Math.floor(property.price / 1000) + 'k' : property.price}
          </text>
        </svg>
      `)}`,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41],
      shadowAnchor: [12, 41]
    });
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    if (onPropertyClick) {
      onPropertyClick(property);
    }
  };

  return (
    <div className={`w-full rounded-[32px] overflow-hidden border transition-all duration-500 ${
      isDarkMode ? 'border-gray-700 bg-gray-800 shadow-2xl' : 'border-gray-200 shadow-lg'
    }`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        className="z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />
        
        <MapClickHandler onMapClick={onMapClick} />
        
        {properties.length > 1 && <MapBounds properties={properties} />}
        
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.lat, property.lng]}
            icon={getMarkerIcon(property)}
            eventHandlers={{
              click: () => handlePropertyClick(property)
            }}
          >
            {showPopups && (
              <Popup className={isDarkMode ? 'dark-popup' : ''}>
                <div className={`p-4 min-w-[220px] rounded-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <h3 className="font-black italic text-base mb-2">{property.title}</h3>
                  <div className="space-y-1 mb-4">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{property.type}</p>
                    <p className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>📍 {property.location}</p>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`font-black text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      NPR {property.price.toLocaleString()}/mo
                    </span>
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${
                      property.available 
                        ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-800')
                        : (isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-800')
                    }`}>
                      {property.available ? 'Available' : 'Occupied'}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePropertyClick(property)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black uppercase tracking-widest text-[10px] px-4 py-3 rounded-xl hover:shadow-lg transition-all"
                  >
                    View Estate details
                  </button>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
