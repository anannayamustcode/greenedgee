import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, Truck, Clock, Star, Package, Leaf, User, CheckCircle, 
  ArrowLeft, Filter, Search, Calendar, ChevronDown, RotateCcw, ShoppingBag
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
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

interface Order {
  id: string;
  type: 'delivery' | 'return';
  productName: string;
  productImage: string;
  quantity: number;
  orderDate: string;
  status: string;
  estimatedDelivery: string;
  totalAmount: string;
  trackingNumber: string;
  customer: {
    name: string;
    address: string;
    phone: string;
  };
  deliveryData?: DeliveryData;
}

const LiveLocationMap: React.FC = () => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [path, setPath] = useState<[number, number][]>([]);

  useEffect(() => {
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(coords);
          setPath((prev) => [...prev, coords]);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
    return () => {
      if (navigator.geolocation && watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  if (!position) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <span className="text-blue-600">Fetching your location...</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden">
      <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>Your Current Location</Popup>
        </Marker>
        {path.length > 1 && (
          <Polyline positions={path} color="blue" />
        )}
      </MapContainer>
    </div>
  );
};

const StoreToCustomer: React.FC = () => {
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState<'delivery' | 'details'>('details');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'delivery' | 'return'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'type'>('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Generate mock orders
  const generateMockOrders = (): Order[] => {
    const statuses = ['Delivered', 'In Transit', 'Processing', 'Pending', 'Cancelled', 'Returned'];
    const products = [
      { name: 'Fresh Groceries Package', image: '/cabbage.jpg', description: 'Fruits, vegetables, dairy' },
      { name: 'Electronics Bundle', image: '/cabbage.jpg', description: 'Smartphone, headphones, charger' },
      { name: 'Home Decor Set', image: '/cabbage.jpg', description: 'Vases, candles, decorative items' },
      { name: 'Books Collection', image: '/cabbage.jpg', description: 'Fiction, non-fiction, textbooks' },
      { name: 'Clothing Package', image: '/cabbage.jpg', description: 'Shirts, pants, accessories' },
      { name: 'Kitchen Appliances', image: '/cabbage.jpg', description: 'Blender, toaster, cookware' },
      { name: 'Sports Equipment', image: '/cabbage.jpg', description: 'Balls, equipment, gear' },
      { name: 'Beauty Products', image: '/cabbage.jpg', description: 'Skincare, makeup, perfumes' },
      { name: 'Pet Supplies', image: '/cabbage.jpg', description: 'Food, toys, accessories' },
      { name: 'Office Supplies', image: '/cabbage.jpg', description: 'Stationery, organizers, tech' }
    ];
    
    const customers = [
      { name: 'John Smith', address: '123 Main St, New York, NY 10001', phone: '+1 (555) 123-4567' },
      { name: 'Sarah Johnson', address: '456 Oak Ave, Los Angeles, CA 90210', phone: '+1 (555) 234-5678' },
      { name: 'Mike Davis', address: '789 Pine Rd, Chicago, IL 60601', phone: '+1 (555) 345-6789' },
      { name: 'Emily Brown', address: '321 Elm St, Houston, TX 77001', phone: '+1 (555) 456-7890' },
      { name: 'David Wilson', address: '654 Maple Dr, Phoenix, AZ 85001', phone: '+1 (555) 567-8901' }
    ];

    return Array.from({ length: 25 }, (_, i) => {
      const product = products[i % products.length];
      const customer = customers[i % customers.length];
      const type = Math.random() > 0.7 ? 'return' : 'delivery';
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const orderDate = new Date(2023, 10, Math.floor(Math.random() * 30) + 1);
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(orderDate.getDate() + Math.floor(Math.random() * 7) + 1);
      
      return {
        id: `ORD-2023-${String(7890 + i).padStart(4, '0')}`,
        type,
        productName: product.name,
        productImage: product.image,
        quantity: Math.floor(Math.random() * 5) + 1,
        orderDate: orderDate.toLocaleDateString(),
        status,
        estimatedDelivery: deliveryDate.toLocaleDateString(),
        totalAmount: `$${(Math.random() * 200 + 50).toFixed(2)}`,
        trackingNumber: `TRK-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        customer,
        deliveryData: i === 0 ? {
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
            currentLocation: [51.505, -0.09]
          },
          product: {
            name: product.name,
            image: product.image,
            description: product.description,
            quantity: 1,
            orderId: `ORD-2023-${String(7890 + i).padStart(4, '0')}`,
            orderTime: orderDate.toLocaleString()
          },
          updates: [
            { time: '10:30 AM', status: 'Order Processed', completed: true },
            { time: '11:15 AM', status: 'Dispatched from Store', completed: true },
            { time: '11:45 AM', status: 'In Transit', completed: true },
            { time: '12:30 PM', status: 'Out for Delivery', completed: false },
            { time: '01:00 PM', status: 'Delivered', completed: false }
          ],
          rating: 4.5
        } : undefined
      };
    });
  };

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockOrders = generateMockOrders();
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Filter and sort orders
  useEffect(() => {
    let filtered = orders.filter(order => {
      const matchesType = filterType === 'all' || order.type === filterType;
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesSearch = searchTerm === '' || 
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesStatus && matchesSearch;
    });

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, filterType, filterStatus, sortBy, searchTerm]);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setActiveTab('delivery');
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    setActiveTab('details');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in transit': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'return' ? <RotateCcw className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-blue-800">Loading orders...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">
            {selectedOrder ? 'Order Tracking' : 'Order Management'}
          </h1>
          {/* <p className="text-blue-600">
            {selectedOrder ? 'Track your order in real-time' : 'Manage all your orders and returns'}
          </p> */}
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-1 inline-flex" role="tablist">
            <button 
              role="tab"
              className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center ${
                activeTab === 'details' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              onClick={() => {
                setActiveTab('details');
                if (selectedOrder) setSelectedOrder(null);
              }}
            >
              <Package className="w-4 h-4 mr-2" />
              {selectedOrder ? 'Back to Orders' : 'Order Details'}
            </button>
            <button 
              role="tab"
              className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center ${
                activeTab === 'delivery' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              onClick={() => setActiveTab('delivery')}
            >
              <Truck className="w-4 h-4 mr-2" />
              Delivery Status
            </button>
          </div>
        </div>

        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 'details' && !selectedOrder && (
            <div className="space-y-6">
              {/* Search and Filter Bar */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 w-full lg:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search orders, products, or customers..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full lg:w-auto">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                
                {showFilters && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value as 'all' | 'delivery' | 'return')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Types</option>
                          <option value="delivery">Delivery</option>
                          <option value="return">Return</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Status</option>
                          <option value="Delivered">Delivered</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Processing">Processing</option>
                          <option value="Pending">Pending</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Returned">Returned</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'type')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="date">Order Date</option>
                          <option value="status">Status</option>
                          <option value="type">Type</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Orders List */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-blue-800">
                    Orders ({filteredOrders.length})
                  </h2>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => handleOrderClick(order)}
                      className="p-6 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={order.productImage}
                            alt={order.productName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-bold text-blue-800">{order.productName}</h3>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                                order.type === 'return' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {getTypeIcon(order.type)}
                                <span className="capitalize">{order.type}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{order.customer.name}</p>
                            <p className="text-sm text-blue-600">{order.id} • Qty: {order.quantity}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${getStatusColor(order.status)}`}>
                            {order.status}
                          </div>
                          <p className="text-sm text-gray-600">{order.orderDate}</p>
                          <p className="text-sm font-medium text-blue-800">{order.totalAmount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && !selectedOrder && (
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-blue-800 mb-2">Select an Order</h2>
              <p className="text-blue-600 mb-6">Choose an order from the Order Details tab to view its delivery status</p>
              <button
                onClick={() => setActiveTab('details')}
                className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-yellow-600 transition-all font-medium"
              >
                View Orders
              </button>
            </div>
          )}

          {activeTab === 'delivery' && selectedOrder && selectedOrder.deliveryData && (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={handleBackToOrders}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </button>

              {/* Status Banner */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Order {selectedOrder.id} is {selectedOrder.deliveryData.status}
                    </h2>
                    <p className="opacity-90">Estimated delivery: {selectedOrder.deliveryData.route.time}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(selectedOrder.type)}
                    <Truck className="w-12 h-12 opacity-80" />
                  </div>
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
                    {selectedOrder.deliveryData.updates.map((update, index) => (
                      <StatusItem
                        key={index}
                        {...update}
                        isLast={index === selectedOrder.deliveryData!.updates.length - 1}
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
                        {selectedOrder.deliveryData.driver.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">{selectedOrder.deliveryData.driver.name}</p>
                        <div className="flex items-center text-sm text-blue-600">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          {selectedOrder.deliveryData.driver.rating}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-blue-600 mr-2" />
                        <p className="text-blue-800">{selectedOrder.deliveryData.driver.contact}</p>
                      </div>
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 text-blue-600 mr-2" />
                        <div>
                          <p className="text-blue-800 font-medium">{selectedOrder.deliveryData.driver.vehicle.type}</p>
                          <p className="text-sm text-blue-600">{selectedOrder.deliveryData.driver.vehicle.license}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setShowMap(!showMap)}
                      className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-yellow-600 transition-all font-medium flex items-center justify-center"
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
                  <p className="text-2xl font-bold text-yellow-600">{selectedOrder.deliveryData.route.distance}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h4 className="font-bold text-blue-800 mb-2">ETA</h4>
                  <p className="text-2xl font-bold text-yellow-600">{selectedOrder.deliveryData.route.time}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-bold text-blue-800 mb-2">CO2 Emissions</h4>
                  <p className="text-2xl font-bold text-green-600">{selectedOrder.deliveryData.route.co2}</p>
                </div>
              </div>

              {/* Map Container */}
              {showMap && selectedOrder.deliveryData.route.currentLocation && (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">Live Tracking</h3>
                  <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
                    <MapContainer 
                      center={selectedOrder.deliveryData.route.currentLocation} 
                      zoom={13} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={selectedOrder.deliveryData.route.currentLocation}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-bold">{selectedOrder.deliveryData.driver.name}</p>
                            <p>{selectedOrder.deliveryData.driver.vehicle.type}</p>
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

          {activeTab === 'delivery' && selectedOrder && !selectedOrder.deliveryData && (
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-blue-800 mb-2">Limited Tracking Available</h2>
              <p className="text-blue-600 mb-6">
                Detailed tracking information is not available for this order. 
                Current status: <span className="font-semibold">{selectedOrder.status}</span>
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-600">Order ID:</span>
                  <span className="font-medium text-blue-800">{selectedOrder.id}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-600">Order Date:</span>
                  <span className="font-medium text-blue-800">{selectedOrder.orderDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600">Expected Delivery:</span>
                  <span className="font-medium text-blue-800">{selectedOrder.estimatedDelivery}</span>
                </div>
              </div>
              <button
                onClick={handleBackToOrders}
                className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-yellow-600 transition-all font-medium"
              >
                Back to Orders
              </button>
            </div>
          )}

          {activeTab === 'details' && selectedOrder && (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={handleBackToOrders}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </button>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Product Info */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-yellow-500" />
                    Order Details
                  </h3>
                  <div className="flex flex-col sm:flex-row">
                    <img 
                      src={selectedOrder.productImage} 
                      alt={selectedOrder.productName}
                      className="w-32 h-32 object-cover rounded-lg mb-4 sm:mb-0 sm:mr-6"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-blue-800 text-lg">{selectedOrder.productName}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                          selectedOrder.type === 'return' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {getTypeIcon(selectedOrder.type)}
                          <span className="capitalize">{selectedOrder.type}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-blue-600">Order ID:</span>
                          <span className="font-medium text-blue-800">{selectedOrder.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Quantity:</span>
                          <span className="font-medium text-blue-800">{selectedOrder.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Order Date:</span>
                          <span className="font-medium text-blue-800">{selectedOrder.orderDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Total Amount:</span>
                          <span className="font-medium text-blue-800">{selectedOrder.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Tracking #:</span>
                          <span className="font-medium text-blue-800">{selectedOrder.trackingNumber}</span>
                        </div>
 
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer & Delivery Info */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-yellow-500" />
                    Customer Information
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {selectedOrder.customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">{selectedOrder.customer.name}</p>
                          <p className="text-sm text-blue-600">{selectedOrder.customer.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-blue-600 mr-2 mt-1" />
                        <p className="text-blue-800 text-sm">{selectedOrder.customer.address}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-blue-800 mb-3">Delivery Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-blue-600">Expected Delivery:</span>
                          <span className="font-medium text-blue-800">{selectedOrder.estimatedDelivery}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Delivery Type:</span>
                          <span className="font-medium text-blue-800 capitalize">{selectedOrder.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setActiveTab('delivery')}
                        className="flex-1 bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-yellow-600 transition-all font-medium text-sm"
                      >
                        Track Order
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                        Contact Support
                      </button>
                    </div>
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


// import React, { useState, useEffect } from 'react';
// import { 
//   MapPin, Phone, Truck, Clock, Star, Package, Leaf, User, CheckCircle 
// } from 'lucide-react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';

// // Type definitions
// interface DeliveryUpdate {
//   time: string;
//   status: string;
//   completed: boolean;
// }

// interface Vehicle {
//   type: string;
//   license: string;
//   capacity: string;
// }

// interface Driver {
//   name: string;
//   contact: string;
//   rating: number;
//   vehicle: Vehicle;
// }

// interface Route {
//   distance: string;
//   time: string;
//   co2: string;
//   currentLocation?: [number, number];
// }

// interface Product {
//   name: string;
//   image: string;
//   description: string;
//   quantity: number;
//   orderId: string;
//   orderTime: string;
// }

// interface DeliveryData {
//   status: string;
//   driver: Driver;
//   route: Route;
//   product: Product;
//   updates: DeliveryUpdate[];
//   rating: number;
// }

// const StoreToCustomer: React.FC = () => {
//   const [showMap, setShowMap] = useState(false);
//   const [activeTab, setActiveTab] = useState<'delivery' | 'details'>('delivery');
//   const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch delivery data
//   useEffect(() => {
//     const fetchDeliveryData = async () => {
//       try {
//         // In a real app, this would be an API call
//         // const response = await fetch('/api/delivery');
//         // const data = await response.json();
        
//         // Mock data - replace with actual API call
//         const mockData: DeliveryData = {
//           status: 'In Transit',
//           driver: {
//             name: 'John Doe',
//             contact: '+1 (555) 123-4567',
//             rating: 4.8,
//             vehicle: {
//               type: 'Refrigerated Truck',
//               license: 'TRK-7890',
//               capacity: '2000 kg'
//             }
//           },
//           route: {
//             distance: '15.2 km',
//             time: '32 mins',
//             co2: '4.2 kg',
//             currentLocation: [51.505, -0.09] // London coordinates for demo
//           },
//           product: {
//             name: 'Fresh Groceries Package',
//             image: 'https://via.placeholder.com/150',
//             description: 'Assorted fresh fruits, vegetables and dairy products',
//             quantity: 1,
//             orderId: 'ORD-2023-7890',
//             orderTime: '2023-11-15 10:30 AM'
//           },
//           updates: [
//             { time: '10:30 AM', status: 'Order Processed', completed: true },
//             { time: '11:15 AM', status: 'Dispatched from Store', completed: true },
//             { time: '11:45 AM', status: 'In Transit', completed: true },
//             { time: '12:30 PM', status: 'Out for Delivery', completed: false },
//             { time: '01:00 PM', status: 'Delivered', completed: false }
//           ],
//           rating: 4.5
//         };

//         setDeliveryData(mockData);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'An unknown error occurred');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchDeliveryData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-blue-800">Loading delivery information...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
//         <div className="text-center p-6 bg-white rounded-xl shadow-lg max-w-md">
//           <div className="text-red-500 mb-4">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <h2 className="text-xl font-bold text-blue-800 mb-2">Error Loading Data</h2>
//           <p className="text-blue-600 mb-4">{error}</p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!deliveryData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500">
//         <div className="text-center p-6 bg-white rounded-xl shadow-lg max-w-md">
//           <div className="text-yellow-500 mb-4">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//           </div>
//           <h2 className="text-xl font-bold text-blue-800 mb-2">No Delivery Found</h2>
//           <p className="text-blue-600">We couldn't find any delivery information for your order.</p>
//         </div>
//       </div>
//     );
//   }

//   const StatusIcon: React.FC<{ completed: boolean }> = ({ completed }) => (
//     completed ? 
//       <CheckCircle className="w-5 h-5 text-yellow-500" /> : 
//       <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
//   );

//   const StatusItem: React.FC<DeliveryUpdate & { isLast: boolean }> = ({ time, status, completed, isLast }) => (
//     <div className="flex items-start">
//       <div className="flex-shrink-0 mr-4 mt-1">
//         <StatusIcon completed={completed} />
//       </div>
//       <div className="flex-1">
//         <div className="flex items-center justify-between">
//           <p className={`font-medium ${completed ? 'text-blue-800' : 'text-gray-400'}`}>
//             {status}
//           </p>
//           <p className={`text-sm ${completed ? 'text-blue-600' : 'text-gray-400'}`}>
//             {time}
//           </p>
//         </div>
//         {!isLast && <div className="w-0.5 h-6 bg-gray-200 ml-2 mt-2"></div>}
//       </div>
//     </div>
//   );

//   return (
//     <div className="mt-15 min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 p-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-blue-800 mb-2">Delivery Tracking</h1>
//           <p className="text-blue-600">Track your order in real-time</p>
//         </div>
        
//         {/* Navigation Tabs */}
//         <div className="flex justify-center mb-8">
//           <div className="bg-white rounded-xl shadow-lg p-1 inline-flex" role="tablist">
//             <button 
//               role="tab"
//               aria-selected={activeTab === 'details'}
//               aria-controls="details-tabpanel"
//               id="details-tab"
//               className={`px-8 py-3 rounded-lg font-medium transition-all ${
//                 activeTab === 'details' 
//                   ? 'bg-blue-600 text-white shadow-md' 
//                   : 'text-blue-600 hover:bg-blue-50'
//               }`}
//               onClick={() => setActiveTab('details')}
//             >
//               Order Details
//             </button>
//             <button 
//               role="tab"
//               aria-selected={activeTab === 'delivery'}
//               aria-controls="delivery-tabpanel"
//               id="delivery-tab"
//               className={`px-8 py-3 rounded-lg font-medium transition-all ${
//                 activeTab === 'delivery' 
//                   ? 'bg-blue-600 text-white shadow-md' 
//                   : 'text-blue-600 hover:bg-blue-50'
//               }`}
//               onClick={() => setActiveTab('delivery')}
//             >
//               Delivery Status
//             </button>

//           </div>
//         </div>

//         <div className="transition-all duration-300 ease-in-out">
//           {activeTab === 'delivery' && (
//             <div id="delivery-tabpanel" aria-labelledby="delivery-tab" className="space-y-6">
//               {/* Status Banner */}
//               <div className="bg-gradient-to-r  from-blue-700 to-blue-500 text-white p-6 rounded-2xl shadow-lg">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className="text-2xl font-bold mb-2">Your Order is {deliveryData.status}</h2>
//                     <p className="opacity-90">Estimated delivery: {deliveryData.route.time}</p>
//                   </div>
//                   <Truck className="w-12 h-12 opacity-80" />
//                 </div>
//               </div>

//               <div className="grid lg:grid-cols-3 gap-6">
//                 {/* Delivery Timeline */}
//                 <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
//                   <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
//                     <Clock className="w-5 h-5 mr-2 text-yellow-500" />
//                     Delivery Timeline
//                   </h3>
//                   <div className="space-y-4">
//                     {deliveryData.updates.map((update, index) => (
//                       <StatusItem
//                         key={index}
//                         {...update}
//                         isLast={index === deliveryData.updates.length - 1}
//                       />
//                     ))}
//                   </div>
//                 </div>

//                 {/* Driver & Vehicle Info */}
//                 <div className="bg-white p-6 rounded-2xl shadow-lg">
//                   <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
//                     <User className="w-5 h-5 mr-2 text-yellow-500" />
//                     Driver Details
//                   </h3>
//                   <div className="space-y-4">
//                     <div className="flex items-center p-3 bg-blue-50 rounded-lg">
//                       <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
//                         {deliveryData.driver.name.split(' ').map(n => n[0]).join('')}
//                       </div>
//                       <div>
//                         <p className="font-medium text-blue-800">{deliveryData.driver.name}</p>
//                         <div className="flex items-center text-sm text-blue-600">
//                           <Star className="w-4 h-4 text-yellow-500 mr-1" />
//                           {deliveryData.driver.rating}
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="space-y-3">
//                       <div className="flex items-center">
//                         <Phone className="w-4 h-4 text-blue-600 mr-2" />
//                         <p className="text-blue-800">{deliveryData.driver.contact}</p>
//                       </div>
//                       <div className="flex items-center">
//                         <Truck className="w-4 h-4 text-blue-600 mr-2" />
//                         <div>
//                           <p className="text-blue-800 font-medium">{deliveryData.driver.vehicle.type}</p>
//                           <p className="text-sm text-blue-600">{deliveryData.driver.vehicle.license}</p>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <button 
//                       onClick={() => setShowMap(!showMap)}
//                       className="w-full bg-gradient-to-r  from-blue-700 to-blue-500 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-yellow-600 transition-all font-medium flex items-center justify-center"
//                     >
//                       <MapPin className="w-4 h-4 mr-2" />
//                       {showMap ? 'Hide Map' : 'View Live Location'}
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Route Information */}
//               <div className="grid md:grid-cols-3 gap-6">
//                 <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
//                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <MapPin className="w-6 h-6 text-blue-600" />
//                   </div>
//                   <h4 className="font-bold text-blue-800 mb-2">Distance</h4>
//                   <p className="text-2xl font-bold text-yellow-600">{deliveryData.route.distance}</p>
//                 </div>
                
//                 <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
//                   <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <Clock className="w-6 h-6 text-yellow-600" />
//                   </div>
//                   <h4 className="font-bold text-blue-800 mb-2">ETA</h4>
//                   <p className="text-2xl font-bold text-yellow-600">{deliveryData.route.time}</p>
//                 </div>
                
//                 <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
//                   <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <Leaf className="w-6 h-6 text-green-600" />
//                   </div>
//                   <h4 className="font-bold text-blue-800 mb-2">CO2 Emissions</h4>
//                   <p className="text-2xl font-bold text-green-600">{deliveryData.route.co2}</p>
//                 </div>
//               </div>

//               {/* Map Container */}
//               {showMap && deliveryData.route.currentLocation && (
//                 <div className="bg-white p-6 rounded-2xl shadow-lg">
//                   <h3 className="text-xl font-bold text-blue-800 mb-4">Live Tracking</h3>
//                   <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
//                     <MapContainer 
//                       center={deliveryData.route.currentLocation} 
//                       zoom={13} 
//                       style={{ height: '100%', width: '100%' }}
//                     >
//                       <TileLayer
//                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                       />
//                       <Marker position={deliveryData.route.currentLocation}>
//                         <Popup>
//                           <div className="text-center">
//                             <p className="font-bold">{deliveryData.driver.name}</p>
//                             <p>{deliveryData.driver.vehicle.type}</p>
//                             <p className="text-sm text-gray-600">Last updated: Just now</p>
//                           </div>
//                         </Popup>
//                       </Marker>
//                     </MapContainer>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'details' && (
//             <div id="details-tabpanel" aria-labelledby="details-tab" className="grid lg:grid-cols-2 gap-6">
//               {/* Product Info */}
//               <div className="bg-white p-6 rounded-2xl shadow-lg">
//                 <h3 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
//                   <Package className="w-5 h-5 mr-2 text-yellow-500" />
//                   Order Details
//                 </h3>
//                 <div className="flex flex-col sm:flex-row">
//                   <img 
//                     src={deliveryData.product.image} 
//                     alt={deliveryData.product.name}
//                     className="w-32 h-32 object-cover rounded-lg mb-4 sm:mb-0 sm:mr-6"
//                   />
//                   <div className="flex-1">
//                     <h4 className="font-bold text-blue-800 text-lg mb-2">{deliveryData.product.name}</h4>
//                     <p className="text-blue-600 mb-4">{deliveryData.product.description}</p>
//                     <div className="space-y-2">
//                       <div className="flex justify-between">
//                         <span className="text-blue-600">Quantity:</span>
//                         <span className="font-medium text-blue-800">{deliveryData.product.quantity}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-blue-600">Order ID:</span>
//                         <span className="font-medium text-blue-800">{deliveryData.product.orderId}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-blue-600">Order Time:</span>
//                         <span className="font-medium text-blue-800">{deliveryData.product.orderTime}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Customer Support */}
//               <div className="bg-white p-6 rounded-2xl shadow-lg">
//                 <h3 className="text-xl font-bold text-blue-800 mb-6">Customer Support</h3>
//                 <div className="space-y-6">
//                   <div className="text-center p-4 bg-yellow-50 rounded-lg">
//                     <div className="flex items-center justify-center mb-2">
//                       {[...Array(5)].map((_, i) => (
//                         <Star 
//                           key={i} 
//                           className={`w-5 h-5 ${i < Math.floor(deliveryData.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
//                         />
//                       ))}
//                     </div>
//                     <p className="text-blue-800 font-medium">{deliveryData.rating}/5 Average Rating</p>
//                   </div>
                  
//                   <div className="text-center">
//                     <p className="text-blue-600 mb-4">Need assistance with your order?</p>
//                     <button className="bg-gradient-to-r  from-blue-700 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-yellow-600 transition-all font-medium">
//                       Contact Support
//                     </button>
//                   </div>
                  
//                   <div className="text-center pt-4 border-t border-gray-200">
//                     <p className="text-sm text-blue-600">Available 24/7 for your convenience</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StoreToCustomer;