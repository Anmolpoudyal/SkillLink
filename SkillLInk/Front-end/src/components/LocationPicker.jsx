import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Search, Navigation, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle map click events
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );
        const data = await response.json();
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
      } catch (error) {
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
      }
    },
  });
  return null;
}

// Component to recenter map
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

const LocationPicker = ({
  value = { latitude: null, longitude: null, address: "" },
  onChange,
  placeholder = "Search for a location...",
  className = "",
  showMap = true,
  mapHeight = "300px",
}) => {
  // Default center: Kathmandu, Nepal
  const defaultCenter = { lat: 27.7172, lng: 85.324 };
  
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapCenter, setMapCenter] = useState(
    value.latitude && value.longitude
      ? [value.latitude, value.longitude]
      : [defaultCenter.lat, defaultCenter.lng]
  );
  const [markerPosition, setMarkerPosition] = useState(
    value.latitude && value.longitude
      ? [value.latitude, value.longitude]
      : null
  );
  const [isLocating, setIsLocating] = useState(false);
  
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Search for addresses using Nominatim
  const searchAddress = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=np&limit=5&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      const data = await response.json();
      setSuggestions(
        data.map((item) => ({
          id: item.place_id,
          address: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        }))
      );
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching address:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAddress(query);
    }, 300);
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setMarkerPosition([location.latitude, location.longitude]);
    setMapCenter([location.latitude, location.longitude]);
    setSearchQuery(location.address);
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (onChange) {
      onChange({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );
          const data = await response.json();
          handleLocationSelect({
            latitude,
            longitude,
            address: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          });
        } catch (error) {
          handleLocationSelect({
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          });
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your location. Please search manually.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Clear selection
  const clearSelection = () => {
    setSearchQuery("");
    setMarkerPosition(null);
    setSuggestions([]);
    setShowSuggestions(false);
    if (onChange) {
      onChange({ latitude: null, longitude: null, address: "" });
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value.address && value.address !== searchQuery) {
      setSearchQuery(value.address);
    }
    if (value.latitude && value.longitude) {
      setMarkerPosition([value.latitude, value.longitude]);
      setMapCenter([value.latitude, value.longitude]);
    }
  }, [value]);

  return (
    <div className={`location-picker ${className}`}>
      {/* Search Bar */}
      <div className="relative" ref={searchRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder={placeholder}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSelection}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1"
          >
            <Navigation className={`h-4 w-4 ${isLocating ? "animate-pulse" : ""}`} />
            {isLocating ? "..." : ""}
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleLocationSelect(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 line-clamp-2">
                    {suggestion.address}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Searching indicator */}
        {isSearching && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-sm text-gray-500">
            <Search className="h-4 w-4 inline animate-pulse mr-2" />
            Searching...
          </div>
        )}
      </div>

      {/* Map */}
      {showMap && (
        <div className="mt-3 rounded-lg overflow-hidden border border-gray-200" style={{ height: mapHeight }}>
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={handleLocationSelect} />
            <MapRecenter center={mapCenter} />
            {markerPosition && (
              <Marker position={markerPosition} icon={customIcon} />
            )}
          </MapContainer>
        </div>
      )}

      {/* Selected Location Info */}
      {markerPosition && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-xs text-green-700">
            📍 Location selected: {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;

// Distance calculation utility (Haversine formula)
export function calculateDistance(lat1, lon1, lat2, lon2, unit = "km") {
  const R = unit === "km" ? 6371 : 3959; // Earth's radius in km or miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Format distance for display
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}
