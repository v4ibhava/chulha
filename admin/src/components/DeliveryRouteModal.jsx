import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaStore, FaUser } from 'react-icons/fa';
import { 
  XMarkIcon, 
  MapPinIcon, 
  ClipboardIcon, 
  ArrowTopRightOnSquareIcon, 
  ExclamationTriangleIcon, 
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

// Global Fallback in case no local configuration exists
const FALLBACK_DEFAULT_LAT = 19.0760;
const FALLBACK_DEFAULT_LNG = 72.8777;

export default function DeliveryRouteModal({ destination, onClose }) {
  const mapContainerRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const routePolylineInstance = useRef(null);
  const markersRef = useRef([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [routeStats, setRouteStats] = useState(null); // { distance: km, duration: mins }
  const [mapEngineLoaded, setMapEngineLoaded] = useState(false);
  const [resolvedCoords, setResolvedCoords] = useState(null); // { lat, lng }

  // 1. Kitchen Coordinate State (loaded from localStorage or Env fallback)
  const [kitchenCoords, setKitchenCoords] = useState(() => {
    try {
      const saved = localStorage.getItem('chulha_kitchen_coords');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lng) return parsed;
      }
    } catch (e) {
      console.error("Failed to load local kitchen coordinates", e);
    }
    
    // Env fallback or generic default
    const envLat = import.meta.env.VITE_RESTAURANT_LAT ? parseFloat(import.meta.env.VITE_RESTAURANT_LAT) : null;
    const envLng = import.meta.env.VITE_RESTAURANT_LNG ? parseFloat(import.meta.env.VITE_RESTAURANT_LNG) : null;
    
    return {
      lat: envLat || FALLBACK_DEFAULT_LAT,
      lng: envLng || FALLBACK_DEFAULT_LNG,
      name: "Chulha Central Kitchen",
      isDefault: !envLat && !envLng
    };
  });

  // 2. Kitchen Setup / Configuration Panel States
  const [showConfig, setShowConfig] = useState(false);
  const [configAddress, setConfigAddress] = useState('');
  const [configLat, setConfigLat] = useState(kitchenCoords.lat.toString());
  const [configLng, setConfigLng] = useState(kitchenCoords.lng.toString());
  const [configName, setConfigName] = useState(kitchenCoords.name);
  const [geocodingConfig, setGeocodingConfig] = useState(false);

  // Generate Google Maps Directions URL safely based on configured kitchen
  const directionsUrl = resolvedCoords 
    ? `https://www.google.com/maps/dir/?api=1&origin=${kitchenCoords.lat},${kitchenCoords.lng}&destination=${resolvedCoords.lat},${resolvedCoords.lng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.addressStreet)}`;

  // Dynamic loading of Leaflet scripts (identical to GoogleMapPicker for bulletproof compatibility)
  useEffect(() => {
    let isMounted = true;

    // 1. Append Leaflet Stylesheet dynamically if missing
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // 2. Append Leaflet Script dynamically if missing
    if (window.L) {
      if (isMounted) setMapEngineLoaded(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (isMounted) setMapEngineLoaded(true);
      };
      
      script.onerror = () => {
        toast.error('Failed to load map visualizer.');
        if (isMounted) {
          setErrorMsg('Failed to load map visualizer.');
          setLoading(false);
        }
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Geocode customer address if coordinates are missing
  useEffect(() => {
    let isMounted = true;
    const geocodeAddress = async () => {
      const inputLat = parseFloat(destination.lat);
      const inputLng = parseFloat(destination.lng);

      if (!isNaN(inputLat) && !isNaN(inputLng)) {
        setResolvedCoords({ lat: inputLat, lng: inputLng });
        return;
      }

      try {
        setLoading(true);
        setErrorMsg('');
        
        // Call open street map nominatim search API
        const q = `${destination.addressStreet} ${destination.addressCity || ''}`.trim();
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
        
        const response = await fetch(url, {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'ChulhaFoodApp/1.0',
          }
        });
        
        const data = await response.json();
        if (isMounted) {
          if (data && data[0]) {
            setResolvedCoords({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon)
            });
          } else {
            console.warn('First geocoding attempt failed. Retrying with street name only...');
            // Retry with just street name in case city/landmark is confusing the geocoder
            const retryUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination.addressStreet)}&limit=1`;
            const retryResponse = await fetch(retryUrl, {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'ChulhaFoodApp/1.0',
              }
            });
            const retryData = await retryResponse.json();
            
            if (retryData && retryData[0]) {
              setResolvedCoords({
                lat: parseFloat(retryData[0].lat),
                lng: parseFloat(retryData[0].lon)
              });
            } else {
              setErrorMsg('Could not find delivery address coordinates on OpenStreetMap.');
              setLoading(false);
            }
          }
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        if (isMounted) {
          setErrorMsg('Error looking up address location coordinates.');
          setLoading(false);
        }
      }
    };

    geocodeAddress();
    return () => {
      isMounted = false;
    };
  }, [destination]);

  // Initialize Map and Fetch Route once Leaflet, customer coordinates, and kitchen coordinates are loaded
  useEffect(() => {
    if (!mapEngineLoaded || !window.L || !resolvedCoords) return;

    const initMapAndRoute = async () => {
      const destLat = resolvedCoords.lat;
      const destLng = resolvedCoords.lng;
      const originLat = kitchenCoords.lat;
      const originLng = kitchenCoords.lng;

      try {
        setLoading(true);
        setErrorMsg('');

        // 1. Clean up old map instance if it exists
        if (leafletMapInstance.current) {
          leafletMapInstance.current.remove();
          leafletMapInstance.current = null;
        }
        markersRef.current = [];

        // 2. Initialize Leaflet Map
        const map = window.L.map(mapContainerRef.current, {
          zoomControl: false,
        }).setView([originLat, originLng], 13);
        leafletMapInstance.current = map;

        // 3. Add beautiful CartoDB Light visuals
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map);

        window.L.control.zoom({ position: 'bottomright' }).addTo(map);

        // 4. Create markers for Kitchen and Customer using clean React Icons via renderToStaticMarkup
        const kitchenIconMarkup = renderToStaticMarkup(
          <div className="w-6 h-6 flex items-center justify-center bg-zinc-900 rounded-full shadow-md border border-white cursor-default">
            <FaStore style={{ color: 'white', width: '11px', height: '11px' }} />
          </div>
        );

        const customerIconMarkup = renderToStaticMarkup(
          <div className="w-6 h-6 flex items-center justify-center bg-red-500 rounded-full shadow-md border border-white cursor-default">
            <FaUser style={{ color: 'white', width: '11px', height: '11px' }} />
          </div>
        );

        const kitchenIcon = window.L.divIcon({
          className: 'custom-kitchen-marker',
          html: kitchenIconMarkup,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const customerIcon = window.L.divIcon({
          className: 'custom-customer-marker',
          html: customerIconMarkup,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const kitchenMarker = window.L.marker([originLat, originLng], { icon: kitchenIcon })
          .addTo(map)
          .bindPopup(`<b>${kitchenCoords.name}</b><br/>Dispatch Center`);

        const customerMarker = window.L.marker([destLat, destLng], { icon: customerIcon })
          .addTo(map)
          .bindPopup(`<b>${destination.customerName}</b><br/>${destination.addressStreet}`);

        markersRef.current = [kitchenMarker, customerMarker];

        // 5. Fetch point-to-point route coordinates from free OSRM Routing service
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
        const response = await fetch(osrmUrl);
        const routeData = await response.json();

        if (routeData.code === 'Ok' && routeData.routes && routeData.routes[0]) {
          const route = routeData.routes[0];
          const distanceKm = (route.distance / 1000).toFixed(1);
          const rawDurationMins = Math.round(route.duration / 60);
          const durationMins = rawDurationMins > 0 ? rawDurationMins + 2 : 5;

          setRouteStats({
            distance: distanceKm,
            duration: durationMins
          });

          // Draw the route path polyline (with beautiful primary red color and smooth border)
          const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Swap to lat,lng
          
          if (routePolylineInstance.current) {
            map.removeLayer(routePolylineInstance.current);
          }

          // Outer shadow/glow line
          window.L.polyline(coordinates, {
            color: '#ef4444',
            weight: 8,
            opacity: 0.25
          }).addTo(map);

          // Inner solid brand red line
          const polyline = window.L.polyline(coordinates, {
            color: '#ef4444',
            weight: 4,
            opacity: 0.9,
            lineJoin: 'round'
          }).addTo(map);
          routePolylineInstance.current = polyline;

          // Fit bounds to fit both points perfectly with padding
          map.fitBounds(window.L.latLngBounds([
            [originLat, originLng],
            [destLat, destLng]
          ]), { padding: [50, 50] });

        } else {
          // Fallback to straight dashed line if route lookup fails
          console.warn('OSRM routing failed. Rendering straight line fallback.');
          const polyline = window.L.polyline([
            [originLat, originLng],
            [destLat, destLng]
          ], {
            color: '#ef4444',
            weight: 3,
            dashArray: '5, 8',
            opacity: 0.8
          }).addTo(map);
          routePolylineInstance.current = polyline;

          // Straight line math approximation
          const dLat = destLat - originLat;
          const dLng = destLng - originLng;
          const approxDistance = Math.sqrt(dLat * dLat + dLng * dLng) * 111; // ~111km per lat degree
          setRouteStats({
            distance: approxDistance.toFixed(1),
            duration: Math.round(approxDistance * 3) // Approx 3 mins per km
          });

          map.fitBounds(window.L.latLngBounds([
            [originLat, originLng],
            [destLat, destLng]
          ]), { padding: [50, 50] });
        }

      } catch (err) {
        console.error('Error fetching delivery route:', err);
        setErrorMsg('Error setting up delivery route calculation.');
      } finally {
        setLoading(false);
      }
    };

    initMapAndRoute();

    // Clean up on component unmount
    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, [mapEngineLoaded, resolvedCoords, kitchenCoords]);

  // Handle Kitchen Address search to auto-populate coordinates
  const handleGeocodeKitchen = async (e) => {
    e.preventDefault();
    if (!configAddress.trim()) return;
    setGeocodingConfig(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(configAddress)}&limit=1`;
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'ChulhaFoodApp/1.0',
        }
      });
      const data = await response.json();
      if (data && data[0]) {
        setConfigLat(parseFloat(data[0].lat).toFixed(6));
        setConfigLng(parseFloat(data[0].lon).toFixed(6));
        toast.success('Successfully found location coordinates!');
      } else {
        toast.error('Could not find location. Try a different address query.');
      }
    } catch (err) {
      console.error('Kitchen geocoding error:', err);
      toast.error('Geocoding service unavailable.');
    } finally {
      setGeocodingConfig(false);
    }
  };

  // Get current browser position to set kitchen location instantly
  const handleGetBrowserGPSForKitchen = () => {
    if (!navigator.geolocation) {
      toast.error('Your browser does not support GPS Geolocation.');
      return;
    }
    setGeocodingConfig(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setConfigLat(pos.coords.latitude.toFixed(6));
        setConfigLng(pos.coords.longitude.toFixed(6));
        toast.success('Acquired your current physical GPS coordinates!');
        setGeocodingConfig(false);
      },
      (err) => {
        console.error('GPS kitchen capture failed:', err);
        toast.error('Could not acquire GPS. Please enter manually or verify permissions.');
        setGeocodingConfig(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Save new configured kitchen location
  const handleSaveKitchen = () => {
    const latVal = parseFloat(configLat);
    const lngVal = parseFloat(configLng);
    if (isNaN(latVal) || isNaN(lngVal)) {
      toast.error('Please input valid numeric coordinates.');
      return;
    }

    const updatedKitchen = {
      lat: latVal,
      lng: lngVal,
      name: configName.trim() || 'Chulha Kitchen',
      isDefault: false
    };

    localStorage.setItem('chulha_kitchen_coords', JSON.stringify(updatedKitchen));
    setKitchenCoords(updatedKitchen);
    setShowConfig(false);
    toast.success('Kitchen dispatch location saved and re-mapped!');
  };

  const copyRiderLink = () => {
    navigator.clipboard.writeText(directionsUrl);
    toast.success('Rider navigation link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col h-[85vh] sm:h-[80vh] border border-neutral-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-5 h-5 text-red-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V11.25c0-.447-.268-.852-.678-1.02l-2.284-.914A1.125 1.125 0 0 0 18 10.339V14.25m-3-4.5V14.25M6.75 15h2.25m-2.25-6.75h2.25M3.375 7.5h17.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125H3.375A1.125 1.125 0 0 1 2.25 18.375v-9.75c0-.621.504-1.125 1.125-1.125Z" />
              </svg>
              Delivery Route Optimizer
            </h2>
            <p className="text-zinc-400 text-xs mt-0.5">
              Calculating fastest path from <span className="font-semibold text-white">{kitchenCoords.name}</span> to <span className="font-semibold text-white">{destination.customerName}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowConfig(!showConfig);
                // reset form fields to current coordinates
                setConfigLat(kitchenCoords.lat.toString());
                setConfigLng(kitchenCoords.lng.toString());
                setConfigName(kitchenCoords.name);
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                showConfig 
                  ? 'bg-red-500 border-red-400 text-white hover:bg-red-600'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700'
              }`}
              title="Configure Restaurant kitchen coordinates"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              <span>{showConfig ? 'Close Settings' : 'Configure Kitchen'}</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Warning Banner if central kitchen coordinates are still set to Mumbai default */}
        {kitchenCoords.isDefault && !showConfig && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between shrink-0 text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <b>Action Required:</b> Your kitchen location is currently set to the default Mumbai base. Set your actual kitchen coordinates to calculate accurate routes.
              </span>
            </div>
            <button
              onClick={() => setShowConfig(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-0.5 rounded transition-all ml-4"
            >
              Set Location Now
            </button>
          </div>
        )}

        {/* Kitchen Configuration Panel (collapsible settings area) */}
        {showConfig && (
          <div className="bg-neutral-50 px-6 py-5 border-b border-neutral-200 shrink-0 animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Restaurant / Central Kitchen Coordinates</h3>
              <p className="text-[10px] text-neutral-400 font-medium">Changes immediately recalculate driving paths</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              {/* Outlet Name */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Outlet Name</label>
                <input 
                  type="text" 
                  value={configName} 
                  onChange={e => setConfigName(e.target.value)} 
                  placeholder="e.g. Indiranagar Kitchen" 
                  className="w-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 transition-all"
                />
              </div>

              {/* Text Address search to geocode coordinates */}
              <form onSubmit={handleGeocodeKitchen} className="md:col-span-5 flex flex-col">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Search Store Address</label>
                <div className="flex gap-1.5">
                  <input 
                    type="text" 
                    value={configAddress} 
                    onChange={e => setConfigAddress(e.target.value)} 
                    placeholder="Type street, landmark or city..." 
                    className="w-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={geocodingConfig || !configAddress.trim()}
                    className="bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-bold px-3 transition-all shrink-0 active:scale-95 disabled:opacity-50"
                  >
                    {geocodingConfig ? '⏳' : 'Search'}
                  </button>
                </div>
              </form>

              {/* Latitude and Longitude values */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Latitude</label>
                <input 
                  type="number" 
                  step="0.000001" 
                  value={configLat} 
                  onChange={e => setConfigLat(e.target.value)} 
                  className="w-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 transition-all font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Longitude</label>
                <input 
                  type="number" 
                  step="0.000001" 
                  value={configLng} 
                  onChange={e => setConfigLng(e.target.value)} 
                  className="w-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleGetBrowserGPSForKitchen}
                className="text-xs text-neutral-600 hover:text-red-500 font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-4 h-4 text-neutral-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                Use My Current GPS Coordinates
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-bold rounded-xl text-xs transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveKitchen}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-red-500/10 flex items-center gap-1"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Save Location</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info panel with statistics */}
        {!showConfig && (
          <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 shrink-0 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Distance Card */}
              <div className="bg-white px-4 py-2 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" className="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8m-3-11.25L3.75 6.75m16.5 0L12 3.75m0 16.5L3.75 17.25m16.5 0L12 20.25" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Distance</p>
                  <p className="text-sm font-extrabold text-neutral-800">
                    {loading ? '---' : errorMsg ? 'N/A' : `${routeStats?.distance} km`}
                  </p>
                </div>
              </div>

              {/* Time Card */}
              <div className="bg-white px-4 py-2 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" className="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Est. Travel Time</p>
                  <p className="text-sm font-extrabold text-green-600">
                    {loading ? 'Calculating...' : errorMsg ? 'N/A' : `~${routeStats?.duration} mins`}
                  </p>
                </div>
              </div>

              {/* Destination Info Card */}
              <div className="bg-white px-4 py-2 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-3 max-w-[280px]">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" className="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Delivery To</p>
                  <p className="text-xs font-semibold text-neutral-700 truncate" title={destination.addressStreet}>
                    {destination.addressStreet}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyRiderLink}
                disabled={loading && !resolvedCoords}
                className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 hover:text-neutral-900 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer border border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy link to send to delivery driver"
              >
                <ClipboardIcon className="w-4 h-4" />
                <span>Copy Link for Rider</span>
              </button>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-red-500/10"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                <span>Open Navigation</span>
              </a>
            </div>
          </div>
        )}

        {/* Map Area */}
        <div className="flex-1 w-full relative bg-neutral-100 min-h-0">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs z-20">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-neutral-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-red-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-xs font-bold text-neutral-700 mt-4 animate-pulse">Plotting optimal street route...</p>
            </div>
          )}

          {errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50 px-6 text-center z-20">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-3 text-amber-500">
                <ExclamationTriangleIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-neutral-800 mb-1">Could Not Geocode Address</p>
              <p className="text-xs text-neutral-500 max-w-sm mb-4">
                "{destination.addressStreet}" could not be auto-located. Try opening navigation directly or verify the customer address spelling.
              </p>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                <span>Search Directly in Google Maps</span>
              </a>
            </div>
          )}

          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-white flex items-center justify-between shrink-0 text-[10px] text-neutral-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-zinc-900 rounded-full border border-white shadow-xs"></span>
            <span>Origin ({kitchenCoords.name})</span>
            <span className="mx-1 text-neutral-300">|</span>
            <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full border border-white shadow-xs animate-pulse"></span>
            <span>Destination (Customer)</span>
          </div>
          <span className="font-semibold uppercase tracking-wider text-[9px] text-neutral-400">
            Powered by OSRM & Leaflet Engine
          </span>
        </div>

      </div>
    </div>
  );
}
