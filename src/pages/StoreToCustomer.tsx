import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, Truck, Clock, Star, Package, Leaf, User, CheckCircle 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Type definitions
interface DeliveryUpdate {
  time: string;
  status: string;
  completed: boolean;
}

interface Vehicle {
  type: string;
  license: string;
  capacity: string;
}

interface Driver {
  name: string;
  contact: string;
  rating: number;
  vehicle: Vehicle;
}

interface Route {
  distance: string;
  time: string;
  co2: string;
  currentLocation?: [number, number];
}

interface Product {
  name: string;
  image: string;
  description: string;
  quantity: number;
  orderId: string;
  orderTime: string;
}

interface DeliveryData {
  status: string;
  driver: Driver;
  route: Route;
  product: Product;
  updates: DeliveryUpdate[];
  rating: number;
}

const StoreToCustomer: React.FC = () => {
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState<'delivery' | 'details'>('delivery');
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch delivery data
  useEffect(() => {
    const fetchDeliveryData = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/delivery');
        // const data = await response.json();
        
        // Mock data - replace with actual API call
        const mockData: DeliveryData = {
          status: 'In Transit',
          driver: {
            name: 'John Doe',
            contact: '+1 (555) 123-4567',
            rating: 4.8,
            vehicle: {
              type: 'Refrigerated Truck',
              license: 'TRK-7890',
              capacity: '2000 kg'
            }
          },
          route: {
            distance: '15.2 km',
            time: '32 mins',
            co2: '4.2 kg',
            currentLocation: [51.505, -0.09] // London coordinates for demo
          },
          product: {
            name: 'Fresh Groceries Package',
            image: 'https://via.placeholder.com/150',
            description: 'Assorted fresh fruits, vegetables and dairy products',
            quantity: 1,
            orderId: 'ORD-2023-7890',
            orderTime: '2023-11-15 10:30 AM'
          },
          updates: [
            { time: '10:30 AM', status: 'Order Processed', completed: true },
            { time: '11:15 AM', status: 'Dispatched from Store', completed: true },
            { time: '11:45 AM', status: 'In Transit', completed: true },
            { time: '12:30 PM', status: 'Out for Delivery', completed: false },
            { time: '01:00 PM', status: 'Delivered', completed: false }
          ],
          rating: 4.5
        };

        setDeliveryData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeliveryData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-blue-800">Loading delivery information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-blue-800 mb-2">Error Loading Data</h2>
          <p className="text-blue-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!deliveryData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-yellow-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-blue-800 mb-2">No Delivery Found</h2>
          <p className="text-blue-600">We couldn't find any delivery information for your order.</p>
        </div>
      </div>
    );
  }

  const StatusIcon: React.FC<{ completed: boolean }> = ({ completed }) => (
    completed ? 
      <CheckCircle className="w-5 h-5 text-yellow-500" /> : 
      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
  );

  const StatusItem: React.FC<DeliveryUpdate & { isLast: boolean }> = ({ time, status, completed, isLast }) => (
    <div className="flex items-start">
      <div className="flex-shrink-0 mr-4 mt-1">
        <StatusIcon completed={completed} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className={`font-medium ${completed ? 'text-blue-800' : 'text-gray-400'}`}>
            {status}
          </p>
          <p className={`text-sm ${completed ? 'text-blue-600' : 'text-gray-400'}`}>
            {time}
          </p>
        </div>
        {!isLast && <div className="w-0.5 h-6 bg-gray-200 ml-2 mt-2"></div>}
      </div>
    </div>
  );

  return (
    <div className="mt-15 min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Delivery Tracking</h1>
          <p className="text-blue-600">Track your order in real-time</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-1 inline-flex" role="tablist">
            <button 
              role="tab"
              aria-selected={activeTab === 'delivery'}
              aria-controls="delivery-tabpanel"
              id="delivery-tab"
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'delivery' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              onClick={() => setActiveTab('delivery')}
            >
              Delivery Status
            </button>
            <button 
              role="tab"
              aria-selected={activeTab === 'details'}
              aria-controls="details-tabpanel"
              id="details-tab"
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'details' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Order Details
            </button>
          </div>
        </div>

        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 'delivery' && (
            <div id="delivery-tabpanel" aria-labelledby="delivery-tab" className="space-y-6">
              {/* Status Banner */}
              <div className="bg-gradient-to-r  from-blue-700 to-blue-500 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Your Order is {deliveryData.status}</h2>
                    <p className="opacity-90">Estimated delivery: {deliveryData.route.time}</p>
                  </div>
                  <Truck className="w-12 h-12 opacity-80" />
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Delivery Timeline */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-yellow-500" />
                    Delivery Timeline
                  </h3>
                  <div className="space-y-4">
                    {deliveryData.updates.map((update, index) => (
                      <StatusItem
                        key={index}
                        {...update}
                        isLast={index === deliveryData.updates.length - 1}
                      />
                    ))}
                  </div>
                </div>

                {/* Driver & Vehicle Info */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-yellow-500" />
                    Driver Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {deliveryData.driver.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">{deliveryData.driver.name}</p>
                        <div className="flex items-center text-sm text-blue-600">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          {deliveryData.driver.rating}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-blue-600 mr-2" />
                        <p className="text-blue-800">{deliveryData.driver.contact}</p>
                      </div>
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 text-blue-600 mr-2" />
                        <div>
                          <p className="text-blue-800 font-medium">{deliveryData.driver.vehicle.type}</p>
                          <p className="text-sm text-blue-600">{deliveryData.driver.vehicle.license}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setShowMap(!showMap)}
                      className="w-full bg-gradient-to-r  from-blue-700 to-blue-500 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-yellow-600 transition-all font-medium flex items-center justify-center"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {showMap ? 'Hide Map' : 'View Live Location'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-blue-800 mb-2">Distance</h4>
                  <p className="text-2xl font-bold text-yellow-600">{deliveryData.route.distance}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h4 className="font-bold text-blue-800 mb-2">ETA</h4>
                  <p className="text-2xl font-bold text-yellow-600">{deliveryData.route.time}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-bold text-blue-800 mb-2">CO2 Emissions</h4>
                  <p className="text-2xl font-bold text-green-600">{deliveryData.route.co2}</p>
                </div>
              </div>

              {/* Map Container */}
              {showMap && deliveryData.route.currentLocation && (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">Live Tracking</h3>
                  <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
                    <MapContainer 
                      center={deliveryData.route.currentLocation} 
                      zoom={13} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={deliveryData.route.currentLocation}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-bold">{deliveryData.driver.name}</p>
                            <p>{deliveryData.driver.vehicle.type}</p>
                            <p className="text-sm text-gray-600">Last updated: Just now</p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div id="details-tabpanel" aria-labelledby="details-tab" className="grid lg:grid-cols-2 gap-6">
              {/* Product Info */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-yellow-500" />
                  Order Details
                </h3>
                <div className="flex flex-col sm:flex-row">
                  <img 
                    src={deliveryData.product.image} 
                    alt={deliveryData.product.name}
                    className="w-32 h-32 object-cover rounded-lg mb-4 sm:mb-0 sm:mr-6"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-800 text-lg mb-2">{deliveryData.product.name}</h4>
                    <p className="text-blue-600 mb-4">{deliveryData.product.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-600">Quantity:</span>
                        <span className="font-medium text-blue-800">{deliveryData.product.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Order ID:</span>
                        <span className="font-medium text-blue-800">{deliveryData.product.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Order Time:</span>
                        <span className="font-medium text-blue-800">{deliveryData.product.orderTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Support */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-blue-800 mb-6">Customer Support</h3>
                <div className="space-y-6">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < Math.floor(deliveryData.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-blue-800 font-medium">{deliveryData.rating}/5 Average Rating</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-blue-600 mb-4">Need assistance with your order?</p>
                    <button className="bg-gradient-to-r  from-blue-700 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-yellow-600 transition-all font-medium">
                      Contact Support
                    </button>
                  </div>
                  
                  <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-blue-600">Available 24/7 for your convenience</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreToCustomer;