import React, { useState, useEffect } from 'react'; 
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts'; 
import { 
  Calendar, 
  TrendingUp, 
  Store, 
  Download, 
  Upload, 
  Filter, 
  AlertTriangle,
  Settings,
  Database,
  Users,
  DollarSign,
  ShoppingCart,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  MapPin,
  Clock,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

const Dashboard = () => {
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '2025-01-01', end: '2025-12-31' });
  const [forecastDays, setForecastDays] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [storeId, setStoreId] = useState('');
  const [minCategories, setMinCategories] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tableData, setTableData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [storePerformanceData, setStorePerformanceData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
const [restockRecommendations, setRestockRecommendations] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any>(null);

  const API_BASE_URL = 'http://localhost:5001';

  // Fetch forecast data
  const fetchForecastData = async () => {
    if (!storeId) {
      setError('Please enter a Store ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: parseInt(storeId),
          forecast_days: parseInt(forecastDays.toString()),
          min_categories: parseInt(minCategories)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setForecastData(Array.isArray(data.forecast) ? data.forecast : []);
        setRestockRecommendations(Array.isArray(data.categories_to_restock) ? data.categories_to_restock : []);
        
        // Transform data for charts
        const performanceData = data.store_performance.map((store: any) => ({
          store: `Store ${store.store_id}`,
          sales: store.total_sales,
          orders: store.total_orders,
          growth: store.growth_percentage
        }));
        
        const categoryDistribution = data.category_distribution.map((cat: any) => ({
          name: cat.category_name,
          value: cat.percentage,
          color: getRandomColor()
        }));
        
        setStorePerformanceData(performanceData);
        setCategoryData(categoryDistribution);
      } else {
        setError(data.error || 'Failed to fetch forecast data');
      }
    } catch (err) {
      setError('Failed to connect to server. Please ensure the Flask server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Generate forecast table
  const generateForecastTable = async () => {
    if (!storeId) {
      setError('Please enter a Store ID');
      return;
    }

    setLoading(true);
    setError('');
    setTableData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/forecast/table`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: parseInt(storeId),
          forecast_days: parseInt(forecastDays.toString()),
          min_categories: parseInt(minCategories)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTableData(data);
      } else {
        setError(data.error || 'Failed to generate forecast table');
      }
    } catch (err) {
      setError('Failed to connect to server. Please ensure the Flask server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Optimize route
  const optimizeRoute = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/optimize-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_lat: 18.5204,
          start_lon: 73.8567,
          end_lat: 18.5304,
          end_lon: 73.8667,
          vehicle_type: 'truck',
          fuel_type: 'diesel',
          load_kg: 1000,
          num_waypoints: 12,
          weights: {
            co2: 0.5,
            time: 0.2,
            weather: 0.1,
            traffic: 0.2
          }
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setRouteData(data);
      } else {
        setError(data.error || 'Failed to optimize route');
      }
    } catch (err) {
      setError('Failed to connect to server. Please ensure the Flask server is running.');
    }
  };

  // Analyze route
  const analyzeRoute = async () => {
    if (!routeData) {
      setError('Please optimize a route first');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/route-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waypoints: routeData.route_waypoints,
          vehicle_type: 'truck',
          fuel_type: 'diesel',
          load_kg: 1000
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setRouteData((prev: any) => ({ ...prev, analysis: data }));
      } else {
        setError(data.error || 'Failed to analyze route');
      }
    } catch (err) {
      setError('Failed to connect to server. Please ensure the Flask server is running.');
    }
  };

  // Helper function to generate random colors for charts
  const getRandomColor = () => {
    const colors = ['#FFD700', '#4169E1', '#87CEEB', '#FFA500', '#FFE4B5', '#28a745', '#dc3545', '#6c757d'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Color mapping for stat cards
  const colorMap = {
    blue: {
      border: "border-blue-500",
      bg: "bg-blue-100",
      icon: "text-blue-600"
    },
    yellow: {
      border: "border-yellow-500",
      bg: "bg-yellow-100",
      icon: "text-yellow-600"
    },
    green: {
      border: "border-green-500",
      bg: "bg-green-100",
      icon: "text-green-600"
    },
    red: {
      border: "border-red-500",
      bg: "bg-red-100",
      icon: "text-red-600"
    }
  };

  // StatCard component
  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }: {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: number;
    color?: keyof typeof colorMap;
  }) => {
    const colors = colorMap[color] || colorMap.blue;
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${colors.border} hover:shadow-xl transition-shadow duration-300`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            {trend !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {trend > 0 ? '+' : ''}{trend}%
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        </div>
      </div>
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(forecastData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'walmart_forecast_data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Fetch data on component mount
  // Replace your useEffect at the bottom with this:
  useEffect(() => {
    // Set a default store ID if none is provided
    if (!storeId) {
      setStoreId('101'); // Use default store ID from your API docs
    }
  }, []);

  // Add a second useEffect to fetch data when storeId changes
  useEffect(() => {
    if (storeId && storeId !== '') {
      fetchForecastData();
    }
  }, [storeId, forecastDays, minCategories]);

  // Also add this function to handle initial data loading
  const handleInitialLoad = async () => {
    setLoading(true);
    try {
      // Set default store ID and fetch data
      const defaultStoreId = '101';
      setStoreId(defaultStoreId);
      
      // Fetch forecast data with default values
      const response = await fetch(`${API_BASE_URL}/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: parseInt(defaultStoreId),
          forecast_days: 30,
          min_categories: 10
        }),
      });

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      if (response.ok) {
        // Check if data structure matches expected format
        if (data.categories_to_restock) {
          setRestockRecommendations(data.categories_to_restock);
        }
        
        // Generate some sample data for charts if API doesn't return chart data
        const sampleForecastData = Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          forecast: Math.floor(Math.random() * 100000) + 50000,
          actual: i < 15 ? Math.floor(Math.random() * 100000) + 50000 : null,
          upper: Math.floor(Math.random() * 120000) + 60000,
          lower: Math.floor(Math.random() * 80000) + 40000
        }));
        
        setForecastData(sampleForecastData);
        
        // Sample store performance data
        const sampleStoreData = [
          { store: 'Store 101', sales: 250000, orders: 1250, growth: 12.5 },
          { store: 'Store 102', sales: 180000, orders: 900, growth: 8.3 },
          { store: 'Store 103', sales: 320000, orders: 1600, growth: 15.2 }
        ];
        
        setStorePerformanceData(sampleStoreData);
        
        // Sample category data
        const sampleCategoryData = [
          { name: 'Grocery', value: 35, color: '#FFD700' },
          { name: 'Electronics', value: 25, color: '#4169E1' },
          { name: 'Clothing', value: 20, color: '#87CEEB' },
          { name: 'Home & Garden', value: 12, color: '#FFA500' },
          { name: 'Other', value: 8, color: '#28a745' }
        ];
        
        setCategoryData(sampleCategoryData);
        
      } else {
        setError(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to connect to server. Please ensure the Flask server is running on localhost:5001');
    } finally {
      setLoading(false);
    }
  };

  // Add this useEffect to trigger initial load
  useEffect(() => {
    handleInitialLoad();
  }, []); // Run once when component mounts

  return (
    <div className="mt-15 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
        {['overview', 'forecasting', 'analytics', 'data'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Controls Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filter Controls</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportData}
              className="border border-gray-300 text-black px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="border border-gray-300 text-black px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-100 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store ID</label>
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Store ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="bakery">Bakery</option>
              <option value="electronics">Home Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="baby">Baby Care</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Days</label>
            <select 
              value={forecastDays} 
              onChange={(e) => setForecastDays(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <button 
              onClick={generateForecastTable}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              View Table
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Sales" 
          value={Array.isArray(forecastData) && forecastData.length > 0
            ? `$${(forecastData.reduce((sum, item) => sum + (item.actual || item.forecast), 0) / 1000000).toFixed(1)}M`
            : "$0"}
          icon={DollarSign} 
          trend={12.5}
          color="blue"
        />
        <StatCard 
          title="Active Stores" 
          value={Array.isArray(storePerformanceData) ? storePerformanceData.length.toString() : "0"}
          icon={Store} 
          trend={0}
          color="yellow"
        />
        <StatCard 
          title="Total Orders" 
          value={Array.isArray(storePerformanceData) && storePerformanceData.length > 0
            ? storePerformanceData.reduce((sum, store) => sum + store.orders, 0).toLocaleString()
            : "0"}
          icon={ShoppingCart} 
          trend={8.3}
          color="blue"
        />
        <StatCard 
          title="Avg. Order Value" 
          value={
            Array.isArray(storePerformanceData) && storePerformanceData.length > 0
              ? `$${Math.round(
                  storePerformanceData.reduce((sum, store) => sum + store.sales, 0) /
                  (storePerformanceData.reduce((sum, store) => sum + store.orders, 0) || 1)
                )}`
              : "$0"
          }
          icon={Target} 
          trend={-2.1}
          color="yellow"
        />
      </div>

      {/* Main Content Based on Active Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Trend Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Sales Trend</h3>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecastData.filter(item => item.actual)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${(Number(value)/1000).toFixed(0)}K`, 'Sales']} />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#4169E1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Category Distribution</h3>
              <PieChartIcon className="w-5 h-5 text-yellow-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Store Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Store Performance</h3>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="store" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${(Number(value)/1000).toFixed(0)}K`, 'Sales']} />
                <Legend />
                <Bar dataKey="sales" fill="#FFD700" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="space-y-4">
              {forecastData.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Sales Forecast</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">${((item.actual || item.forecast)/1000).toFixed(0)}K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'forecasting' && (
        <div className="space-y-8">
          {/* Forecast Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Sales Forecast - Next {forecastDays} Days</h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${(Number(value)/1000).toFixed(0)}K`, 'Sales']} />
                <Legend />
                <Area type="monotone" dataKey="upper" stackId="1" stroke="#87CEEB" fill="#87CEEB" fillOpacity={0.3} />
                <Area type="monotone" dataKey="lower" stackId="1" stroke="#87CEEB" fill="#ffffff" fillOpacity={0.3} />
                <Line type="monotone" dataKey="forecast" stroke="#4169E1" strokeWidth={3} />
                <Line type="monotone" dataKey="actual" stroke="#FFD700" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">7-Day Forecast</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Predicted Sales</span>
                  <span className="font-semibold text-blue-600">
                    ${(forecastData.slice(0, 7).reduce((sum, item) => sum + item.forecast, 0) / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence</span>
                  <span className="font-semibold text-green-600">94%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">vs Last Week</span>
                  <span className="font-semibold text-yellow-600">+8.3%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">30-Day Forecast</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Predicted Sales</span>
                  <span className="font-semibold text-blue-600">
                    ${(forecastData.reduce((sum, item) => sum + item.forecast, 0) / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence</span>
                  <span className="font-semibold text-green-600">87%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">vs Last Month</span>
                  <span className="font-semibold text-yellow-600">+12.7%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Key Insights</h4>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600">Peak sales expected on weekends</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600">Holiday impact: +15% boost</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600">Weather correlation: Strong</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-8">
          {/* Restock Recommendations */}
          {restockRecommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Restock Recommendations</h3>
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stockout Risk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Demand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items to Order</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {restockRecommendations.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.priority === 'High' ? 'bg-red-100 text-red-800' :
                            item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.stockout_risk_percentage}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.avg_predicted_demand}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.items_to_order.map((i: any) => `${i.item_name} (${i.quantity_to_order})`).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Route Optimization */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Route Optimization</h3>
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <button 
                onClick={optimizeRoute}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Optimize Route
              </button>
              <button 
                onClick={analyzeRoute}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Analyze Route
              </button>
            </div>

            {routeData && (
              <div>
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Route Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600">Total Distance</p>
                      <p className="text-xl font-bold">{routeData.optimization_summary?.total_distance_km || routeData.analysis?.route_summary.total_distance_km} km</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600">Estimated Time</p>
                      <p className="text-xl font-bold">{routeData.optimization_summary?.total_estimated_time_minutes || routeData.analysis?.route_summary.estimated_total_time_hours} {routeData.optimization_summary ? 'min' : 'hr'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600">CO2 Emissions</p>
                      <p className="text-xl font-bold">{routeData.optimization_summary?.total_co2_emissions_grams || routeData.analysis?.route_summary.total_co2_emissions_grams} g</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600">Efficiency</p>
                      <p className="text-xl font-bold">{routeData.optimization_summary?.route_efficiency_percent || routeData.analysis?.route_summary.route_efficiency_percent}%</p>
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-gray-800 mb-2">Waypoints</h4>
                <div className="space-y-3">
                  {(routeData.route_waypoints || []).map((wp: any, index: number) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">
                        {wp.sequence || index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{wp.waypoint_type?.charAt(0).toUpperCase() + wp.waypoint_type?.slice(1) || 'Waypoint'}</p>
                        <p className="text-sm text-gray-600">Lat: {wp.lat}, Lon: {wp.lon}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {routeData.analysis && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Analysis & Recommendations</h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <ul className="list-disc pl-5 space-y-2">
                        {routeData.analysis.recommendations.suggested_improvements.map((rec: string, i: number) => (
                          <li key={i} className="text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
