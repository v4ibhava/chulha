import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  MapPinIcon, 
  PlusIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  MagnifyingGlassIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';

// Default starting point when adding first kitchen (e.g. general default, completely editable)
const DEFAULT_MAP_CENTER_LAT = 19.0760;
const DEFAULT_MAP_CENTER_LNG = 72.8777;

export default function SelectKitchen() {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const leafletMarkerInstance = useRef(null);
  
  const [mapEngineLoaded, setMapEngineLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Kitchen Data list loaded from localStorage (Starts EMPTY, no Mumbai hardcodes!)
  const [kitchensList, setKitchensList] = useState(() => {
    try {
      const saved = localStorage.getItem('chulha_kitchens_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 2. Active Kitchen selected by the admin
  const [activeKitchen, setActiveKitchen] = useState(() => {
    try {
      const saved = localStorage.getItem('chulha_kitchen_coords');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 3. Form States for Adding a Kitchen
  const [outletName, setOutletName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [kitchenLat, setKitchenLat] = useState(DEFAULT_MAP_CENTER_LAT);
  const [kitchenLng, setKitchenLng] = useState(DEFAULT_MAP_CENTER_LNG);

  // Load Leaflet dynamically
  useEffect(() => {
    let isMounted = true;
    
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

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
        toast.error('Failed to load visual map editor.');
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Map visualizer in the setup form
  useEffect(() => {
    if (!mapEngineLoaded || !window.L || !mapContainerRef.current) return;

    try {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }

      // Initialize map
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([kitchenLat, kitchenLng], 14);
      leafletMapInstance.current = map;

      // Add elegant CartoDB visual tiles
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      window.L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add draggable red pin representing kitchen location
      const redIcon = window.L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div class="w-7 h-7 flex items-center justify-center bg-red-500 rounded-full shadow-md border-2 border-white transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing hover:scale-110 transition-all">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style="width: 13px; height: 13px;">
                   <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                 </svg>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [0, 0]
      });

      const marker = window.L.marker([kitchenLat, kitchenLng], {
        draggable: true,
        icon: redIcon
      }).addTo(map);
      leafletMarkerInstance.current = marker;

      // Dragend updates coordinates in the form
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setKitchenLat(parseFloat(position.lat.toFixed(6)));
        setKitchenLng(parseFloat(position.lng.toFixed(6)));
        handleReverseGeocode(position.lat, position.lng);
      });

      // Map click drags the marker
      map.on('click', (e) => {
        const position = e.latlng;
        marker.setLatLng(position);
        setKitchenLat(parseFloat(position.lat.toFixed(6)));
        setKitchenLng(parseFloat(position.lng.toFixed(6)));
        handleReverseGeocode(position.lat, position.lng);
      });

    } catch (error) {
      console.error('Error loading setup map:', error);
    }

    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, [mapEngineLoaded]);

  // Reverse Geocoding to get human-readable street name when pinning
  const handleReverseGeocode = async (lat, lng) => {
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
      if (data && data.display_name) {
        setSearchQuery(data.display_name);
      }
    } catch (e) {
      console.error('Reverse geocode error:', e);
    }
  };

  // Search Address Geocoding
  const handleSearchAddress = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
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
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        setKitchenLat(parseFloat(lat.toFixed(6)));
        setKitchenLng(parseFloat(lng.toFixed(6)));

        if (leafletMapInstance.current && leafletMarkerInstance.current) {
          leafletMapInstance.current.setView([lat, lng], 16);
          leafletMarkerInstance.current.setLatLng([lat, lng]);
        }
        toast.success('Outlet coordinates resolved successfully!');
      } else {
        toast.error('Location address not found. Please drag map pin manually.');
      }
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Geocoding service busy. Try dragging map pin.');
    } finally {
      setLoading(false);
    }
  };

  // GPS My Location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Your browser does not support automatic geolocation.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setKitchenLat(parseFloat(latitude.toFixed(6)));
        setKitchenLng(parseFloat(longitude.toFixed(6)));

        if (leafletMapInstance.current && leafletMarkerInstance.current) {
          leafletMapInstance.current.setView([latitude, longitude], 16);
          leafletMarkerInstance.current.setLatLng([latitude, longitude]);
        }
        handleReverseGeocode(latitude, longitude);
        toast.success('Acquired your current physical GPS coordinates!');
        setLoading(false);
      },
      (err) => {
        console.error('GPS error:', err);
        toast.error('Unable to fetch device location. Please type search or drag pin.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Add new kitchen to the list
  const handleAddNewKitchen = () => {
    if (!outletName.trim()) {
      toast.error('Please enter a custom Outlet Name.');
      return;
    }

    const newKitchen = {
      id: Date.now().toString(),
      name: outletName.trim(),
      address: searchQuery.trim() || `Coordinates: ${kitchenLat}, ${kitchenLng}`,
      lat: kitchenLat,
      lng: kitchenLng
    };

    const updatedList = [...kitchensList, newKitchen];
    setKitchensList(updatedList);
    localStorage.setItem('chulha_kitchens_list', JSON.stringify(updatedList));

    // Clear form
    setOutletName('');
    setSearchQuery('');
    
    toast.success(`Successfully added "${newKitchen.name}" to kitchen listings!`);
  };

  // Delete kitchen from list
  const handleDeleteKitchen = (id, e) => {
    e.stopPropagation(); // prevent select action
    const updatedList = kitchensList.filter(k => k.id !== id);
    setKitchensList(updatedList);
    localStorage.setItem('chulha_kitchens_list', JSON.stringify(updatedList));

    // If deleting the active kitchen, clear active state
    if (activeKitchen && activeKitchen.id === id) {
      localStorage.removeItem('chulha_kitchen_coords');
      setActiveKitchen(null);
    }
    toast.success('Kitchen outlet listing removed.');
  };

  // Select / Activate a kitchen and navigate to dashboard
  const handleActivateKitchen = (kitchen) => {
    const coords = {
      id: kitchen.id,
      lat: kitchen.lat,
      lng: kitchen.lng,
      name: kitchen.name,
      address: kitchen.address,
      isDefault: false
    };

    localStorage.setItem('chulha_kitchen_coords', JSON.stringify(coords));
    setActiveKitchen(coords);
    toast.success(`Active kitchen set to "${kitchen.name}"!`);
    navigate('/');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-charcoal-800">Dispatch Kitchen Selection</h1>
        <p className="text-charcoal-500 text-sm mt-1">Select an active kitchen outlet to manage menu items, process orders, and plan optimal delivery routes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Active Kitchen & Kitchen Listings */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          {/* Active Kitchen Showcase */}
          <div className="card p-6 bg-charcoal-700 text-white border-none shadow-xl relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="relative">
              <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest block mb-1">Active Kitchen</span>
              {activeKitchen ? (
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" className="w-6 h-6 text-primary-400">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.5a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75h-3.5A.75.75 0 0 0 6 14v3.25c0 .414.336.75.75.75Z" />
                    </svg>
                    {activeKitchen.name}
                  </h2>
                  <p className="text-xs text-charcoal-300 mt-2 flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4 text-primary-400 shrink-0" />
                    <span className="truncate">{activeKitchen.address}</span>
                  </p>
                  <p className="text-[10px] text-charcoal-400 font-mono mt-1">
                    geo: {activeKitchen.lat.toFixed(5)}, {activeKitchen.lng.toFixed(5)}
                  </p>
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-primary-500/20 cursor-pointer text-center block"
                  >
                    Enter Management Dashboard
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                    <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                    <span>No Active Kitchen Selected!</span>
                  </div>
                  <p className="text-xs text-charcoal-300 mt-1">Please select or add a kitchen from the list to begin operations.</p>
                </div>
              )}
            </div>
          </div>

          {/* Kitchen Listings */}
          <div className="card p-5 flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Available Kitchen Outlets</h3>
            
            {kitchensList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.5a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75h-3.5A.75.75 0 0 0 6 14v3.25c0 .414.336.75.75.75Z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-neutral-800">No Kitchens Found</p>
                <p className="text-xs text-neutral-400 mt-1 max-w-[200px]">Add your restaurant outlet coordinates in the panel to your right.</p>
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-1">
                {kitchensList.map((kitchen) => {
                  const isActive = activeKitchen?.id === kitchen.id;
                  return (
                    <div 
                      key={kitchen.id}
                      onClick={() => handleActivateKitchen(kitchen)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                        isActive 
                          ? 'border-primary-500 bg-primary-50/20 shadow-md shadow-primary-500/5' 
                          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50 bg-white'
                      }`}
                    >
                      <div className="min-w-0 flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                          isActive ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-500'
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.5a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75h-3.5A.75.75 0 0 0 6 14v3.25c0 .414.336.75.75.75Z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-neutral-800 flex items-center gap-1.5">
                            <span>{kitchen.name}</span>
                            {isActive && <CheckCircleIcon className="w-4 h-4 text-primary-500 shrink-0" />}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5" title={kitchen.address}>
                            {kitchen.address}
                          </p>
                          <p className="text-[9px] font-mono text-neutral-400 mt-0.5">
                            coords: {kitchen.lat.toFixed(4)}, {kitchen.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteKitchen(kitchen.id, e)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Kitchen Outlet"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Setup & Pin New Kitchen */}
        <div className="lg:col-span-7 card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Configure New Outlet</h3>
            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Interactive Map Setup</span>
          </div>

          {/* Map Setup Container */}
          <div className="w-full h-[220px] rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 relative">
            {!mapEngineLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20">
                <div className="w-8 h-8 border-4 border-neutral-100 border-t-red-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold text-neutral-400 mt-2">Loading Map Engine...</p>
              </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          <div className="space-y-4">
            {/* Input - Outlet Name */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Outlet Display Name</label>
              <input 
                type="text" 
                value={outletName} 
                onChange={e => setOutletName(e.target.value)} 
                placeholder="e.g. Indiranagar Branch" 
                className="w-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 transition-all"
              />
            </div>

            {/* Input - Address Geocoder Search */}
            <form onSubmit={handleSearchAddress}>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Search Address or Landmark</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    placeholder="Type locality or street name to position map pin..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 rounded-xl outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 transition-all"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-neutral-800 hover:bg-neutral-900 active:scale-95 text-xs text-white font-bold px-4 rounded-xl shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Search...' : 'Locate'}
                </button>
              </div>
            </form>

            {/* Display Latitude / Longitude Manual input */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Resolved Latitude</label>
                <input 
                  type="number" 
                  step="0.000001"
                  value={kitchenLat} 
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setKitchenLat(val || 0);
                    if (leafletMarkerInstance.current) {
                      leafletMarkerInstance.current.setLatLng([val || 0, kitchenLng]);
                    }
                  }} 
                  className="w-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 rounded-xl px-4 py-2 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Resolved Longitude</label>
                <input 
                  type="number" 
                  step="0.000001"
                  value={kitchenLng} 
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setKitchenLng(val || 0);
                    if (leafletMarkerInstance.current) {
                      leafletMarkerInstance.current.setLatLng([kitchenLat, val || 0]);
                    }
                  }} 
                  className="w-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 rounded-xl px-4 py-2 outline-none font-mono"
                />
              </div>
            </div>

            {/* Buttons: GPS & Add */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={loading}
                className="text-xs text-neutral-600 hover:text-red-500 font-bold flex items-center gap-1.5 hover:underline cursor-pointer disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-4 h-4 text-neutral-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                Use My Current Location GPS
              </button>
              <button
                type="button"
                onClick={handleAddNewKitchen}
                className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-red-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Kitchen</span>
              </button>
            </div>

          </div>

          <div className="p-4 rounded-xl bg-neutral-50 text-[11px] text-neutral-500 flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-5 h-5 text-amber-500 shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
            </svg>
            <p>You can set coordinates precisely by typing in the search bar, dragging the map pin directly, or clicking anywhere on the map.</p>
          </div>

        </div>

      </div>

    </div>
  );
}
