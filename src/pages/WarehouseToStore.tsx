import React, { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  User, 
  Phone, 
  MapPin, 
  Truck, 
  Clock, 
  Leaf, 
  FileText, 
  ShoppingCart,
  Star,
  Bot,
  BarChart3,
  Plus,
  Minus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

const API_BASE_URL = "http://localhost:5001"; // Your Flask backend

const VendorWarehouseManagement = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedItem, setSelectedItem] = useState(null);
  const [cart, setCart] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // ML-driven inventory
  const [mlInventory, setMlInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // You can make these dynamic/selectable if you want
  const storeId = 101;
  const forecastDays = 30;
  const minCategories = 10;

  useEffect(() => {
    const fetchMLInventory = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/forecast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            store_id: storeId,
            forecast_days: forecastDays,
            min_categories: minCategories
          })
        });
        const data = await response.json();
        if (response.ok && data.categories_to_restock) {
          // Flatten items for inventory grid
          const items = [];
          data.categories_to_restock.forEach(cat => {
            cat.items_to_order.forEach(item => {
              items.push({
                id: `${cat.category}-${item.item_name}`,
                name: item.item_name,
                category: cat.category,
                currentStock: 0, // ML doesn't provide this, set as 0 or fetch from another source
                minStock: 20,    // You can adjust these defaults
                maxStock: 500,
                pricePerUnit: 1.0,
                vendor: "ML Model",
                lastRestocked: "-",
                expiryDate: "-",
                image: "https://via.placeholder.com/100",
                status: "Restock Recommended",
                quantityToOrder: item.quantity_to_order,
                priority: cat.priority,
                stockoutRisk: cat.stockout_risk_percentage
              });
            });
          });
          setMlInventory(items);
        } else {
          setError(data.error || "No inventory data from ML model");
        }
      } catch (err) {
        setError("Could not connect to ML model");
      } finally {
        setLoading(false);
      }
    };
    fetchMLInventory();
  }, [storeId, forecastDays, minCategories]);

  // const [activeTab, setActiveTab] = useState('inventory');
  // const [selectedItem, setSelectedItem] = useState<any[]>([]);
  // const [cart, setCart] = useState([]);
  // const [showOrderForm, setShowOrderForm] = useState(false);

  // Mock data
  const inventoryData = [
    {
      id: 1,
      name: 'Fresh Apples',
      category: 'Fruits',
      currentStock: 150,
      minStock: 50,
      maxStock: 500,
      pricePerUnit: 2.50,
      vendor: 'Green Valley Farms',
      lastRestocked: '2024-01-10',
      expiryDate: '2024-01-25',
      image: 'https://via.placeholder.com/100',
      status: 'In Stock'
    },
    {
      id: 2,
      name: 'Organic Bananas',
      category: 'Fruits',
      currentStock: 25,
      minStock: 50,
      maxStock: 300,
      pricePerUnit: 1.80,
      vendor: 'Organic Harvest Co.',
      lastRestocked: '2024-01-08',
      expiryDate: '2024-01-20',
      image: 'https://via.placeholder.com/100',
      status: 'Low Stock'
    },
    {
      id: 3,
      name: 'Dairy Milk',
      category: 'Dairy',
      currentStock: 200,
      minStock: 100,
      maxStock: 400,
      pricePerUnit: 3.20,
      vendor: 'Fresh Dairy Ltd.',
      lastRestocked: '2024-01-12',
      expiryDate: '2024-01-22',
      image: 'https://via.placeholder.com/100',
      status: 'In Stock'
    },
    {
      id: 4,
      name: 'Whole Grain Bread',
      category: 'Bakery',
      currentStock: 0,
      minStock: 30,
      maxStock: 150,
      pricePerUnit: 4.50,
      vendor: 'Artisan Bakery',
      lastRestocked: '2024-01-05',
      expiryDate: '2024-01-18',
      image: 'https://via.placeholder.com/100',
      status: 'Out of Stock'
    }
  ];

  const vendorData = {
    name: 'Green Valley Farms',
    contact: '+1 (555) 987-6543',
    email: 'contact@greenvalley.com',
    address: '123 Farm Road, Valley Creek, CA 90210',
    rating: 4.7,
    established: '2015',
    specialties: ['Organic Fruits', 'Vegetables', 'Seasonal Produce']
  };

  const driverData = {
    name: 'Mike Johnson',
    contact: '+1 (555) 123-4567',
    rating: 4.8,
    vehicle: {
      type: 'Refrigerated Truck',
      license: 'VEN-4567',
      capacity: '5000 kg',
      fuelType: 'Diesel'
    },
    route: {
      distance: '45.2 km',
      estimatedTime: '1 hour 15 mins',
      co2Emissions: '12.5 kg'
    }
  };

  const storesDemand = [
    { store: 'Downtown Store', demand: 'High', items: ['Apples', 'Milk', 'Bread'] },
    { store: 'Mall Branch', demand: 'Medium', items: ['Bananas', 'Milk'] },
    { store: 'Suburb Store', demand: 'Low', items: ['Apples'] }
  ];

  const aiSuggestions = [
    {
      type: 'Restock Alert',
      message: 'Organic Bananas are running low. Consider ordering 200 units.',
      priority: 'High',
      action: 'Order Now'
    },
    {
      type: 'Demand Forecast',
      message: 'Increased demand for Dairy Milk expected this weekend.',
      priority: 'Medium',
      action: 'View Details'
    },
    {
      type: 'Cost Optimization',
      message: 'Bulk order discount available for Fresh Apples (10% off for 500+ units).',
      priority: 'Low',
      action: 'Apply Discount'
    }
  ];

  const addToCart = (item, quantity) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
  };

  const getStockStatus = (item) => {
    if (item.currentStock === 0) return { status: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (item.currentStock <= item.minStock) return { status: 'Low Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-blue-600 hover:bg-blue-50'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2"> Warehouse to Store Management</h1>
          <p className="text-blue-600">Streamline your inventory and supplier operations</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          <div className="bg-white rounded-xl shadow-lg p-1 flex flex-wrap">
            <TabButton id="inventory" label="Inventory" icon={Package} active={activeTab === 'inventory'} onClick={setActiveTab} />
            <TabButton id="ordering" label="Ordering" icon={ShoppingCart} active={activeTab === 'ordering'} onClick={setActiveTab} />
            <TabButton id="demand" label="Store Demand" icon={TrendingUp} active={activeTab === 'demand'} onClick={setActiveTab} />
            <TabButton id="ai" label="AI Suggestions" icon={Bot} active={activeTab === 'ai'} onClick={setActiveTab} />
            <TabButton id="reports" label="Reports" icon={FileText} active={activeTab === 'reports'} onClick={setActiveTab} />
            <TabButton id="logistics" label="Logistics" icon={Truck} active={activeTab === 'logistics'} onClick={setActiveTab} />
          </div>
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search inventory..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {/* Inventory Grid */}
            {loading ? (
              <div className="text-center text-blue-600 py-8">Loading inventory...</div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">{error}</div>
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {mlInventory.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-blue-800 mb-2">{item.name}</h3>
                    <p className="text-blue-600 text-sm mb-4">{item.category}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recommended Qty:</span>
                        <span className="font-medium text-blue-800">{item.quantityToOrder}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority:</span>
                        <span className="font-medium text-blue-800">{item.priority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stockout Risk:</span>
                        <span className="font-medium text-red-600">{item.stockoutRisk}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ordering Tab */}
        {activeTab === 'ordering' && (
          <div className="space-y-6">
            {/* Quick Order Section */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-blue-800 mb-4">Quick Order</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventoryData.filter(item => item.currentStock <= item.minStock).map(item => (
                  <div key={item.id} className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-red-800">{item.name}</h4>
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-sm text-red-600 mb-3">Current: {item.currentStock} | Min: {item.minStock}</p>
                    <button 
                      onClick={() => addToCart(item, item.maxStock - item.currentStock)}
                      className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all"
                    >
                      Auto-Order ({item.maxStock - item.currentStock} units)
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Shopping Cart */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-blue-800 mb-4">Shopping Cart ({cart.length} items)</h3>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg mr-4" />
                        <div>
                          <h4 className="font-medium text-blue-800">{item.name}</h4>
                          <p className="text-sm text-blue-600">${item.pricePerUnit} per unit</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-blue-800 font-medium mr-4">Qty: {item.quantity}</span>
                        <span className="text-green-600 font-bold">${(item.pricePerUnit * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-blue-800">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${cart.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white py-3 rounded-lg hover:from-blue-700 hover:to-yellow-600 transition-all font-medium">
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Store Demand Tab */}
        {activeTab === 'demand' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storesDemand.map((store, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">{store.store}</h3>
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      store.demand === 'High' ? 'bg-red-100 text-red-800' :
                      store.demand === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {store.demand} Demand
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-800">Requested Items:</h4>
                    {store.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-blue-800">{item}</span>
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestions Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-800 to-blue-500 text-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold mb-2">AI-Powered Insights</h3>
              <p className="opacity-90">Smart recommendations to optimize your inventory management</p>
            </div>

            <div className="grid gap-6">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Bot className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-bold text-blue-800">{suggestion.type}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          suggestion.priority === 'High' ? 'bg-red-100 text-red-800' :
                          suggestion.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {suggestion.priority} Priority
                        </span>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                      {suggestion.action}
                    </button>
                  </div>
                  <p className="text-blue-700">{suggestion.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-blue-800 mb-2">Total Items</h3>
                <p className="text-3xl font-bold text-yellow-600">375</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-blue-800 mb-2">Monthly Orders</h3>
                <p className="text-3xl font-bold text-green-600">24</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-blue-800 mb-2">Low Stock Items</h3>
                <p className="text-3xl font-bold text-red-600">2</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <Package className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-blue-800 mb-2">Total Value</h3>
                <p className="text-3xl font-bold text-yellow-600">$12,450</p>
              </div>
            </div>
          </div>
        )}

        {/* Logistics Tab */}
        {activeTab === 'logistics' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Vendor Details */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-yellow-500" />
                  Vendor Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-blue-800 text-lg mr-10">{vendorData.name}</h4>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-blue-600">{vendorData.rating}/5</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-blue-800">{vendorData.contact}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-blue-800">{vendorData.address}</span>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2 mr-118">Specialties:</h5>
                    <div className="flex flex-wrap gap-2">
                      {vendorData.specialties.map((specialty, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all">
                    Contact Vendor
                  </button>
                </div>
              </div>

              {/* Driver Details */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-yellow-500" />
                  Driver & Vehicle Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {driverData.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-800">{driverData.name}</h4>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-blue-600">{driverData.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-600">Contact:</span>
                      <span className="text-blue-800 font-medium">{driverData.contact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Vehicle:</span>
                      <span className="text-blue-800 font-medium">{driverData.vehicle.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">License:</span>
                      <span className="text-blue-800 font-medium">{driverData.vehicle.license}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Capacity:</span>
                      <span className="text-blue-800 font-medium">{driverData.vehicle.capacity}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Route & CO2 Details */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-bold text-blue-800 mb-2">Distance</h4>
                <p className="text-2xl font-bold text-yellow-600">{driverData.route.distance}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h4 className="font-bold text-blue-800 mb-2">Travel Time</h4>
                <p className="text-2xl font-bold text-yellow-600">{driverData.route.estimatedTime}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                <Leaf className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h4 className="font-bold text-blue-800 mb-2">CO2 Emissions</h4>
                <p className="text-2xl font-bold text-green-600">{driverData.route.co2Emissions}</p>
              </div>
            </div>
          </div>
        )}

        {/* Item Details Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-800">Item Details</h2>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <img 
                      src={selectedItem.image} 
                      alt={selectedItem.name} 
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-xl font-bold text-blue-800 mb-2">{selectedItem.name}</h3>
                    <p className="text-blue-600 mb-4">{selectedItem.category}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-blue-600">Current Stock:</span>
                        <p className="font-bold text-blue-800">{selectedItem.currentStock}</p>
                      </div>
                      <div>
                        <span className="text-blue-600">Min Stock:</span>
                        <p className="font-bold text-blue-800">{selectedItem.minStock}</p>
                      </div>
                      <div>
                        <span className="text-blue-600">Max Stock:</span>
                        <p className="font-bold text-blue-800">{selectedItem.maxStock}</p>
                      </div>
                      <div>
                        <span className="text-blue-600">Price/Unit:</span>
                        <p className="font-bold text-green-600">${selectedItem.pricePerUnit}</p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-blue-600">Vendor:</span>
                      <p className="font-bold text-blue-800">{selectedItem.vendor}</p>
                    </div>
                    
                    <div>
                      <span className="text-blue-600">Last Restocked:</span>
                      <p className="font-bold text-blue-800">{selectedItem.lastRestocked}</p>
                    </div>
                    
                    <div>
                      <span className="text-blue-600">Expiry Date:</span>
                      <p className="font-bold text-blue-800">{selectedItem.expiryDate}</p>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <button 
                        onClick={() => {
                          addToCart(selectedItem, 1);
                          setSelectedItem(null);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-yellow-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-yellow-600 transition-all font-medium"
                      >
                        Add to Cart
                      </button>
                      <button 
                        onClick={() => {
                          addToCart(selectedItem, selectedItem.maxStock - selectedItem.currentStock);
                          setSelectedItem(null);
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all font-medium"
                      >
                        Quick Restock
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorWarehouseManagement;
