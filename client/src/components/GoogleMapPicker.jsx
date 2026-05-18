import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

// Custom Minimalist Charcoal & Primary Red map styling to match the Chulha theme
const customMapStyles = [
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e4e4e7' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#fafafa' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#f4f4f5' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#f4f4f5' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text',
    stylers: [{ visibility: 'simplified' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#f4f4f5' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#d4d4d8' }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#52525b' }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }, { weight: 2 }],
  },
];

// Helper to extract clean address fields from Google Geocoder response
const parseGoogleAddress = (addressComponents) => {
  let streetNumber = '';
  let route = '';
  let sublocality = '';
  let city = '';
  let state = '';
  let pincode = '';

  for (const component of addressComponents) {
    const types = component.types;
    if (types.includes('street_number')) {
      streetNumber = component.long_name;
    } else if (types.includes('route')) {
      route = component.long_name;
    } else if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('neighborhood')) {
      sublocality = component.long_name;
    } else if (types.includes('locality')) {
      city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      state = component.long_name;
    } else if (types.includes('postal_code')) {
      pincode = component.long_name;
    }
  }

  // Fallbacks in case locality isn't present
  if (!city) {
    for (const component of addressComponents) {
      if (component.types.includes('postal_town') || component.types.includes('administrative_area_level_2')) {
        city = component.long_name;
      }
    }
  }

  const streetPart1 = streetNumber || route ? `${streetNumber} ${route}`.trim() : '';
  const street = streetPart1 && sublocality ? `${streetPart1}, ${sublocality}` : streetPart1 || sublocality || '';

  return { street, city, state, pincode };
};

export default function GoogleMapPicker({ defaultLat, defaultLng, onLocationSelect }) {
  const mapContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const [mapEngine, setMapEngine] = useState('loading'); // 'google' | 'leaflet' | 'loading' | 'error'
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Keep refs for active map, marker and geocoder instances
  const googleMapInstance = useRef(null);
  const googleMarkerInstance = useRef(null);
  const leafletMapInstance = useRef(null);
  const leafletMarkerInstance = useRef(null);
  
  // Starting Coordinates: Default to Mumbai/India if not provided
  const initialLat = defaultLat ? parseFloat(defaultLat) : 19.0760;
  const initialLng = defaultLng ? parseFloat(defaultLng) : 72.8777;

  useEffect(() => {
    let isMounted = true;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // --- CASE A: GOOGLE MAPS LOADING ---
    if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && apiKey.trim() !== '') {
      if (window.google && window.google.maps) {
        initGoogleMap(initialLat, initialLng);
      } else {
        // Dynamic loading of Google Maps script
        const scriptId = 'google-maps-api-script';
        let script = document.getElementById(scriptId);
        
        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }

        const handleLoad = () => {
          if (isMounted) initGoogleMap(initialLat, initialLng);
        };

        const handleError = () => {
          if (isMounted) {
            console.warn('Google Maps failed to load. Falling back to open-source Leaflet Map.');
            loadLeaflet(initialLat, initialLng);
          }
        };

        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);

        return () => {
          script.removeEventListener('load', handleLoad);
          script.removeEventListener('error', handleError);
        };
      }
    } 
    // --- CASE B: OPEN-SOURCE LEAFLET FALLBACK ---
    else {
      // Small timeout to show beautiful smooth skeleton transitions
      const timer = setTimeout(() => {
        if (isMounted) loadLeaflet(initialLat, initialLng);
      }, 500);
      return () => clearTimeout(timer);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // --- INITIALIZE GOOGLE MAP ---
  const initGoogleMap = (lat, lng) => {
    try {
      if (!mapContainerRef.current) return;
      setMapEngine('google');

      const center = { lat, lng };
      
      // 1. Create the visual Map
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 15,
        styles: customMapStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      });
      googleMapInstance.current = map;

      // 2. Add Draggable Pin (Marker)
      const marker = new window.google.maps.Marker({
        position: center,
        map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: 'Drag me to adjust delivery address'
      });
      googleMarkerInstance.current = marker;

      // 3. Hook up dragging event to geocoder
      marker.addListener('dragend', () => {
        const newPos = marker.getPosition();
        if (newPos) {
          handleGoogleReverseGeocode(newPos.lat(), newPos.lng());
        }
      });

      // 4. Hook up click on map to position pin
      map.addListener('click', (e) => {
        const clickedPos = e.latLng;
        if (clickedPos) {
          marker.setPosition(clickedPos);
          handleGoogleReverseGeocode(clickedPos.lat(), clickedPos.lng());
        }
      });

      // 5. Hook up Places Autocomplete Search Box
      if (searchInputRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['geocode', 'establishment'],
          fields: ['geometry', 'address_components', 'formatted_address']
        });
        
        // Bind autocomplete to map
        autocomplete.bindTo('bounds', map);
        
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) {
            toast.error('Location details not found for this address. Drag map pin instead.');
            return;
          }

          // Center map & Move Pin
          const loc = place.geometry.location;
          map.setCenter(loc);
          map.setZoom(17);
          marker.setPosition(loc);

          // Update forms and pass back address
          if (place.address_components) {
            const parsed = parseGoogleAddress(place.address_components);
            onLocationSelect({
              ...parsed,
              lat: loc.lat(),
              lng: loc.lng()
            });
            setSearchQuery(place.formatted_address || '');
          }
        });
      }

      // Initial reverse geocode if no address fields were loaded
      if (defaultLat && defaultLng) {
        // Keep current coordinates
      } else {
        handleGoogleReverseGeocode(lat, lng);
      }

    } catch (err) {
      console.error('Error initializing Google Map:', err);
      loadLeaflet(lat, lng);
    }
  };

  // --- REVERSE GEOCODE WITH GOOGLE ---
  const handleGoogleReverseGeocode = (lat, lng) => {
    if (!window.google) return;
    setLoadingAddress(true);
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      setLoadingAddress(false);
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        const parsed = parseGoogleAddress(result.address_components);
        
        onLocationSelect({
          ...parsed,
          lat,
          lng
        });
        setSearchQuery(result.formatted_address || '');
      } else {
        console.error('Google Geocoder failed:', status);
        // Fallback placeholder address
        onLocationSelect({
          street: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
          city: '',
          state: '',
          pincode: '',
          lat,
          lng
        });
      }
    });
  };

  // --- INITIALIZE LEAFLET (OPEN-SOURCE FALLBACK) ---
  const loadLeaflet = (lat, lng) => {
    setMapEngine('leaflet');

    // 1. Append Leaflet Stylesheet dynamically if missing
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // 2. Append Leaflet Script dynamically if missing
    if (window.L) {
      initLeafletMap(lat, lng);
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        initLeafletMap(lat, lng);
      };
      
      script.onerror = () => {
        setMapEngine('error');
        toast.error('Failed to load map systems.');
      };
    }
  };

  const initLeafletMap = (lat, lng) => {
    try {
      if (!mapContainerRef.current || !window.L) return;

      // Clean old instance if exists
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
      }

      // 1. Create Leaflet Map Object
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false, // will add in custom position
      }).setView([lat, lng], 15);
      leafletMapInstance.current = map;

      // 2. Add gorgeous CartoDB light visual tiles (matches modern design perfectly)
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Custom Zoom control positioning
      window.L.control.zoom({ position: 'bottomright' }).addTo(map);

      // 3. Render Custom Red Map Marker Pin using beautiful SVG location pin
      const redIcon = window.L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div class="w-7 h-7 flex items-center justify-center bg-primary-500 rounded-full shadow-md border-2 border-white transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing hover:scale-115 transition-all">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style="width: 13px; height: 13px;">
                   <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                 </svg>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [0, 0]
      });

      const marker = window.L.marker([lat, lng], {
        draggable: true,
        icon: redIcon
      }).addTo(map);
      leafletMarkerInstance.current = marker;

      // 4. Dragend Event
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        handleLeafletReverseGeocode(position.lat, position.lng);
      });

      // 5. Map Click Event to pin location
      map.on('click', (e) => {
        const position = e.latlng;
        marker.setLatLng(position);
        handleLeafletReverseGeocode(position.lat, position.lng);
      });

      // Geocode initial state if required
      if (defaultLat && defaultLng) {
        // Maintain
      } else {
        handleLeafletReverseGeocode(lat, lng);
      }

    } catch (err) {
      console.error('Error initializing Leaflet map:', err);
      setMapEngine('error');
    }
  };

  // --- REVERSE GEOCODE WITH OPENSTREETMAP ---
  const handleLeafletReverseGeocode = async (lat, lng) => {
    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'ChulhaFoodApp/1.0',
          },
        }
      );
      const data = await response.json();
      const addr = data.address || {};
      
      const street = addr.road || addr.suburb || addr.neighbourhood || data.display_name?.split(',')[0] || '';
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const state = addr.state || '';
      const pincode = addr.postcode || '';

      onLocationSelect({
        street,
        city,
        state,
        pincode,
        lat,
        lng
      });
      setSearchQuery(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch (error) {
      console.error('Nominatim geocoder error:', error);
      onLocationSelect({
        street: `Coords: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        city: '',
        state: '',
        pincode: '',
        lat,
        lng
      });
    } finally {
      setLoadingAddress(false);
    }
  };

  // --- OPENSTREETMAP NOMINATIM SEARCH (FOR LEAFLET FALLBACK) ---
  const handleLeafletSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'ChulhaFoodApp/1.0',
          },
        }
      );
      const data = await response.json();
      if (data && data[0]) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);

        // Center map and marker
        if (leafletMapInstance.current && leafletMarkerInstance.current) {
          leafletMapInstance.current.setView([lat, lng], 17);
          leafletMarkerInstance.current.setLatLng([lat, lng]);
        }

        // Run reverse geocode to get clean address component segments
        await handleLeafletReverseGeocode(lat, lng);
      } else {
        toast.error('Location not found. Try searching a different keyword.');
      }
    } catch (error) {
      console.error('Leaflet search error:', error);
      toast.error('Search service currently busy. Try dragging map pin.');
    } finally {
      setLoadingAddress(false);
    }
  };

  // --- GEOLOCATION GETTER ---
  const captureUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Your browser does not support automatic geolocation.');
      return;
    }
    
    setLoadingAddress(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        
        if (mapEngine === 'google' && googleMapInstance.current && googleMarkerInstance.current) {
          const loc = { lat: latitude, lng: longitude };
          googleMapInstance.current.setCenter(loc);
          googleMapInstance.current.setZoom(16);
          googleMarkerInstance.current.setPosition(loc);
          handleGoogleReverseGeocode(latitude, longitude);
        } else if (mapEngine === 'leaflet' && leafletMapInstance.current && leafletMarkerInstance.current) {
          leafletMapInstance.current.setView([latitude, longitude], 16);
          leafletMarkerInstance.current.setLatLng([latitude, longitude]);
          handleLeafletReverseGeocode(latitude, longitude);
        } else {
          setLoadingAddress(false);
        }
      },
      (err) => {
        console.error('Geolocation capture failed:', err);
        toast.error('Unable to fetch device location. Please enable location permissions.');
        setLoadingAddress(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // --- RENDER COMPONENT UI ---
  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-sm">
      
      {/* 1. Primary Map Display Container */}
      <div className="flex-1 w-full relative min-h-[240px]">
        {mapEngine === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-neutral-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-xs font-bold text-charcoal-500 mt-4 animate-pulse">Initializing map visualizer...</p>
          </div>
        )}

        {mapEngine === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50 px-4 text-center z-20">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
              <MapPinIcon className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-bold text-charcoal-700 mb-1">Visual Map Unavailable</p>
            <p className="text-xs text-charcoal-500">Could not initialize connection. Please enter details manually or refresh.</p>
          </div>
        )}

        <div ref={mapContainerRef} className="w-full h-full min-h-[240px]" />
      </div>

      {/* 2. Map Control Actions (Search & Locate Me) - Positioned UNDER the Map */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50/70 flex flex-col sm:flex-row gap-2 shrink-0">
        {mapEngine === 'google' ? (
          // Google Places Autocomplete Input
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for your street, building, or area..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 text-xs font-semibold text-charcoal-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/25 transition-all outline-none"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-charcoal-400" />
          </div>
        ) : (
          // Nominatim Search Input for Leaflet
          <form onSubmit={handleLeafletSearch} className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search delivery locality/address..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 text-xs font-semibold text-charcoal-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/25 transition-all outline-none"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-charcoal-400" />
            </div>
            <button
              type="submit"
              disabled={loadingAddress}
              className="bg-primary-500 hover:bg-primary-600 active:scale-95 text-[11px] text-white font-bold px-3 rounded-xl shadow-md shadow-primary-500/10 transition-all shrink-0"
            >
              Search
            </button>
          </form>
        )}

        {/* Device GPS Location Quick Access */}
        <button
          type="button"
          onClick={captureUserLocation}
          disabled={loadingAddress}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 active:scale-95 text-charcoal-700 hover:text-primary-500 border border-neutral-200 rounded-xl transition-all disabled:opacity-50 text-xs font-bold shrink-0"
        >
          {loadingAddress ? (
            <svg className="animate-spin h-3.5 w-3.5 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-3.5 h-3.5 text-charcoal-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          )}
          <span>Mark My Location</span>
        </button>
      </div>

      {/* 3. Sleek Map Engine Indicator Footer */}
      <div className="px-4 py-2 border-t border-neutral-200 bg-white/95 text-[10px] text-charcoal-400 flex items-center justify-between shrink-0 font-medium">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${loadingAddress ? 'bg-primary-500 animate-ping' : 'bg-green-500'}`}></span>
          <span>
            {loadingAddress 
              ? 'Retrieving address...' 
              : `Active Pin: Drag or click to change delivery point.`}
          </span>
        </div>
        <span className="font-semibold uppercase tracking-wider text-[9px]">
          {mapEngine === 'google' ? '⚡ Google Maps Engine' : '🍃 OpenStreetMap Engine'}
        </span>
      </div>
    </div>
  );
}
