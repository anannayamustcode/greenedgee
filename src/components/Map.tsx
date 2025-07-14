import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons
const warehouseIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

type WarehouseToStoreProps = {
  startLabel?: string;
  endLabel?: string;
  startColor?: string;
  endColor?: string;
  startCoords?: [number, number];
  endCoords?: [number, number];
  onRouteCalculated?: (route: any) => void;
};

const WarehouseToStore: React.FC<WarehouseToStoreProps> = ({
  startLabel = "Warehouse",
  endLabel = "Store",
  startColor = "text-blue-600",
  endColor = "text-red-600",
  startCoords: initialStartCoords,
  endCoords: initialEndCoords,
  onRouteCalculated
}) => {
  // State management
  const [startCoords, setStartCoords] = useState<[number, number] | null>(initialStartCoords || null);
  const [endCoords, setEndCoords] = useState<[number, number] | null>(initialEndCoords || null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [co2Emission, setCo2Emission] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [routeInstructions, setRouteInstructions] = useState<any[]>([]);
  const [activeInstruction, setActiveInstruction] = useState<number>(0);
  const [betterRouteAvailable, setBetterRouteAvailable] = useState(false);
  const [proposedRoute, setProposedRoute] = useState<[number, number][] | null>(null);
  const [proposedStats, setProposedStats] = useState<{ distance: number, duration: number, co2: number } | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [vehicleType, setVehicleType] = useState("truck");
  const [fuelType, setFuelType] = useState("diesel");
  const [loadKg, setLoadKg] = useState(1500);


  const mapRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Parse coordinate input
  const parseCoordinates = (coordString: string): [number, number] => {
    const coords = coordString.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length !== 2 || coords.some(isNaN)) {
      throw new Error('Invalid coordinates format. Please use "latitude, longitude"');
    }
    return [coords[0], coords[1]];
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const [lat1, lon1] = point1;
    const [lat2, lon2] = point2;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate route distance
  const calculateRouteDistance = (route: [number, number][]): number => {
    let total = 0;
    for (let i = 0; i < route.length - 1; i++) {
      total += calculateDistance(route[i], route[i + 1]);
    }
    return total;
  };

  // Calculate CO2 emissions based on distance and vehicle type
  const calculateCO2 = (distance: number): number => {
    // Average CO2 emissions for a delivery truck (grams per km)
    const emissionsPerKm = 200;
    return (distance * emissionsPerKm) / 1000; // Convert to kg
  };

  // Generate a realistic alternative route (dummy implementation)
  const generateAlternativeRoute = (currentRoute: [number, number][]): [number, number][] => {
    if (currentRoute.length < 2) return currentRoute;

    // Create a modified version of the route
    const alternative: [number, number][] = [];
    const midPoint = Math.floor(currentRoute.length / 2);

    // First half stays the same
    for (let i = 0; i < midPoint; i++) {
      alternative.push([...currentRoute[i]]);
    }

    // Create a detour in the middle
    const detourStrength = 0.003 * (Math.random() * 2 - 1); // Small random variation

    for (let i = midPoint; i < currentRoute.length; i++) {
      alternative.push([
        currentRoute[i][0] + detourStrength,
        currentRoute[i][1] + detourStrength
      ]);
    }

    return alternative;
  };

  const getRoute = useCallback(async (start: [number, number], end: [number, number]) => {
    try {
      setIsLoading(true);

      const response = await fetch('http://localhost:5001/optimize-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_lat: start[0],
          start_lon: start[1],
          end_lat: end[0],
          end_lon: end[1],
          vehicle_type: vehicleType,
          fuel_type: fuelType,
          load_kg: loadKg
        })

      });

      const data = await response.json();

      if (data.status !== 'success' || !data.route_waypoints) {
        throw new Error("Route data unavailable");
      }

      // Extract lat/lon pairs for the polyline
      const routeGeometry: [number, number][] = data.route_waypoints.map((wp: any) => [wp.lat, wp.lon]);

      // Extract metrics from optimization_summary
      const summary = data.optimization_summary;
      const routeDistance = summary.total_distance_km || calculateRouteDistance(routeGeometry);
      const routeDuration = summary.total_estimated_time_minutes || (routeDistance * 1.5); // fallback
      const co2 = summary.total_co2_emissions_kg || calculateCO2(routeDistance);

      setRoute(routeGeometry);
      setDistance(routeDistance);
      setDuration(routeDuration);
      setCo2Emission(co2);
      setRouteInstructions([]); // Optional: could convert segment_details into steps if desired

      // Callback with route data if needed
      if (onRouteCalculated) {
        onRouteCalculated({
          geometry: routeGeometry,
          distance: routeDistance,
          duration: routeDuration,
          co2: co2,
          steps: [] // optional: build from segment_details
        });
      }

      return routeGeometry;

    } catch (err) {
      console.error("Error fetching route from backend:", err);
      const fallback = [start, end];
      const fallbackDistance = calculateDistance(start, end);
      setRoute(fallback);
      setDistance(fallbackDistance);
      setDuration(fallbackDistance * 1.5);
      setCo2Emission(calculateCO2(fallbackDistance));
      return fallback;
    } finally {
      setIsLoading(false);
    }
  }, [onRouteCalculated]);

  // Simulate WebSocket connection to ML model
  const connectToModel = useCallback(() => {
    try {
      // In a real implementation, this would connect to your WebSocket server
      // For now, we'll simulate the connection
      setSocketConnected(true);

      // Simulate receiving a better route after 5 seconds
      setTimeout(() => {
        if (isNavigating && route.length > 0) {
          const alternativeRoute = generateAlternativeRoute(route);
          const currentDistance = calculateRouteDistance(route);
          const newDistance = calculateRouteDistance(alternativeRoute);

          // Only suggest if at least 5% better
          if (newDistance < currentDistance * 0.95) {
            setProposedRoute(alternativeRoute);
            setProposedStats({
              distance: newDistance,
              duration: newDistance * 1.3, // Dummy duration calculation
              co2: calculateCO2(newDistance)
            });
            setBetterRouteAvailable(true);
          }
        }
      }, 5000);
    } catch (err) {
      console.error('Connection error:', err);
      setSocketConnected(false);
    }
  }, [isNavigating, route]);

  // Start navigation
  const startNavigation = async () => {
    try {
      const startInput = (document.getElementById('start-coords') as HTMLInputElement)?.value;
      const endInput = (document.getElementById('end-coords') as HTMLInputElement)?.value;

      let start = startCoords;
      let end = endCoords;

      if (startInput && endInput) {
        start = parseCoordinates(startInput);
        end = parseCoordinates(endInput);
      } else if (!start || !end) {
        throw new Error('Coordinates are required');
      }

      setStartCoords(start);
      setEndCoords(end);
      setError(null);
      setIsLoading(true);

      // Calculate initial route
      await getRoute(start, end);

      setIsNavigating(true);
      connectToModel();

      // Start watching user's position
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (position) => {
            const userPos: [number, number] = [
              position.coords.latitude,
              position.coords.longitude
            ];
            setCurrentPosition(userPos);

            // Update active instruction
            if (route.length > 0 && routeInstructions.length > 0) {
              let closestPointIndex = 0;
              let minDistance = Infinity;

              route.forEach((point, index) => {
                const dist = Math.sqrt(
                  Math.pow(point[0] - userPos[0], 2) +
                  Math.pow(point[1] - userPos[1], 2)
                );
                if (dist < minDistance) {
                  minDistance = dist;
                  closestPointIndex = index;
                }
              });

              const progress = closestPointIndex / route.length;
              const activeIndex = Math.floor(progress * routeInstructions.length);
              setActiveInstruction(activeIndex);
            }
          },
          (err) => {
            console.error('Geolocation error:', err);
            setError('Unable to track your location. Please ensure location services are enabled.');
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
          }
        );
      } else {
        setError('Geolocation is not supported by your browser.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid coordinates');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop navigation
  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentPosition(null);
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Accept the new route
  const acceptNewRoute = () => {
    if (proposedRoute && proposedStats) {
      setRoute(proposedRoute);
      setDistance(proposedStats.distance);
      setDuration(proposedStats.duration);
      setCo2Emission(proposedStats.co2);
      setBetterRouteAvailable(false);
      setProposedRoute(null);
      setProposedStats(null);
    }
  };

  // Reject the new route
  const rejectNewRoute = () => {
    setBetterRouteAvailable(false);
    setProposedRoute(null);
    setProposedStats(null);
  };

  // Format time
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Initialize with props if provided
  useEffect(() => {
    if (initialStartCoords && initialEndCoords) {
      setStartCoords(initialStartCoords);
      setEndCoords(initialEndCoords);
      getRoute(initialStartCoords, initialEndCoords);
    }
  }, [initialStartCoords, initialEndCoords, getRoute]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-96 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                <span className={startColor}>{startLabel}</span> to <span className={endColor}>{endLabel}</span> Navigation
              </h1>

              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    disabled={isNavigating || isLoading}
                  >
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="bike">Bike</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Type
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    disabled={isNavigating || isLoading}
                  >
                    <option value="diesel">Diesel</option>
                    <option value="petrol">Petrol</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Load Weight (kg)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={loadKg}
                    onChange={(e) => setLoadKg(parseFloat(e.target.value))}
                    disabled={isNavigating || isLoading}
                    placeholder="e.g., 1500"
                  />
                </div>

                {!initialStartCoords && (
                  <div>
                    <label htmlFor="start-coords" className="block text-sm font-medium text-gray-700 mb-1">
                      {startLabel} Location (lat, lng)
                    </label>
                    <input
                      id="start-coords"
                      type="text"
                      placeholder="e.g., 40.7128, -74.0060"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isNavigating || isLoading}
                    />
                  </div>
                )}

                {!initialEndCoords && (
                  <div>
                    <label htmlFor="end-coords" className="block text-sm font-medium text-gray-700 mb-1">
                      {endLabel} Location (lat, lng)
                    </label>
                    <input
                      id="end-coords"
                      type="text"
                      placeholder="e.g., 34.0522, -118.2437"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isNavigating || isLoading}
                    />
                  </div>
                )}

                {!isNavigating ? (
                  <button
                    onClick={startNavigation}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating route...
                      </span>
                    ) : 'Start Navigation'}
                  </button>
                ) : (
                  <button
                    onClick={stopNavigation}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Stop Navigation
                  </button>
                )}
              </div>

              {(isNavigating || isLoading) && (
                <div className="mt-6 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Route Summary</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-2 rounded">
                        <p className="text-sm text-gray-500">Distance</p>
                        <p className="font-bold">{distance.toFixed(1)} km</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-bold">{formatTime(duration)}</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-sm text-gray-500">CO₂ Emissions</p>
                        <p className="font-bold">{co2Emission.toFixed(1)} kg</p>
                      </div>
                    </div>
                  </div>

                  {routeInstructions.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Next Steps</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {routeInstructions.map((step: any, index: number) => (
                          <div
                            key={index}
                            className={`p-3 rounded ${index === activeInstruction ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-white'}`}
                          >
                            <p className={`font-medium ${index === activeInstruction ? 'text-blue-800' : 'text-gray-700'}`}>
                              {step.maneuver.instruction}
                            </p>
                            <p className="text-sm text-gray-500">
                              {step.distance > 1000
                                ? `${(step.distance / 1000).toFixed(1)} km`
                                : `${Math.round(step.distance)} m`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentPosition && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Current Position</h3>
                      <p className="font-mono text-gray-700">
                        {currentPosition[0].toFixed(6)}, {currentPosition[1].toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Map Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
              {typeof window !== 'undefined' && (
                <MapContainer
                  center={startCoords || [40, -100]}
                  zoom={startCoords ? 12 : 4}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {startCoords && (
                    <Marker position={startCoords} icon={warehouseIcon}>
                      <Popup className="font-semibold">{startLabel} Location</Popup>
                    </Marker>
                  )}

                  {endCoords && (
                    <Marker position={endCoords} icon={storeIcon}>
                      <Popup className="font-semibold">{endLabel} Location</Popup>
                    </Marker>
                  )}

                  {currentPosition && (
                    <Marker position={currentPosition} icon={userIcon}>
                      <Popup className="font-semibold">Your Location</Popup>
                    </Marker>
                  )}

                  {route.length > 0 && (
                    <Polyline
                      positions={route}
                      pathOptions={{
                        color: '#3b82f6',
                        weight: 5,
                        opacity: 0.7
                      }}
                    />
                  )}

                  {proposedRoute && (
                    <Polyline
                      positions={proposedRoute}
                      pathOptions={{
                        color: '#10B981',
                        weight: 5,
                        opacity: 0.7,
                        dashArray: '10, 10'
                      }}
                    />
                  )}
                  {route.length > 0 && route.map((coords, index) => (
                    <Marker
                      key={`wp-${index}`}
                      position={coords}
                      icon={L.divIcon({
                        className: 'waypoint-marker',
                        html: `<div style="width: 10px; height: 10px; background-color: #10b981; border-radius: 50%; border: 2px solid white;"></div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6],
                      })}
                    />
                  ))}

                </MapContainer>

              )}
            </div>
          </div>
        </div>
      </div>

      {betterRouteAvailable && proposedStats && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <div className="bg-white p-4 rounded-xl shadow-xl border-2 border-blue-400">
            <h3 className="font-bold text-lg mb-2">Better Route Available!</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <p className="text-sm text-gray-500">Distance</p>
                <p className="font-bold">{proposedStats.distance.toFixed(1)} km</p>
                <p className="text-xs text-gray-500">
                  {(distance - proposedStats.distance).toFixed(1)} km saved
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-bold">{formatTime(proposedStats.duration)}</p>
                <p className="text-xs text-gray-500">
                  {formatTime(duration - proposedStats.duration)} saved
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">CO₂</p>
                <p className="font-bold">{proposedStats.co2.toFixed(1)} kg</p>
                <p className="text-xs text-gray-500">
                  {(co2Emission - proposedStats.co2).toFixed(1)} kg saved
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={rejectNewRoute}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Keep Current
              </button>
              <button
                onClick={acceptNewRoute}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Use New Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseToStore;