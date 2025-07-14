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
  PieChart as PieChartIcon // <-- Fix: alias PieChart from lucide-react to PieChartIcon
} from 'lucide-react';

const Dashboard = () => {
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '2025-01-01', end: '2025-12-31' });
  const [includeHolidays, setIncludeHolidays] = useState(true);
  const [forecastDays, setForecastDays] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  // Sample data based on your Walmart dataset
  const sampleData = [
    { date: '2025-01-01', sales: 299000, store: 104, category: 'Bakery', holiday: "New Year's Day", weather: 'Sunny' },
    { date: '2025-01-02', sales: 494000, store: 101, category: 'Home electronics', holiday: "New Year's Day", weather: 'Clear' },
    { date: '2025-01-03', sales: 686000, store: 101, category: 'Furniture', holiday: "New Year's Day", weather: 'Rainy' },
    { date: '2025-01-04', sales: 325000, store: 101, category: 'Pest control', holiday: "New Year's Day", weather: 'Stormy' },
    { date: '2025-01-05', sales: 494000, store: 102, category: 'Baby wipes', holiday: "New Year's Day", weather: 'Cloudy' },
    { date: '2025-01-06', sales: 490000, store: 104, category: 'Home electronics', holiday: "New Year's Day", weather: 'Stormy' },
    { date: '2025-01-07', sales: 566000, store: 104, category: 'Hair care', holiday: "New Year's Day", weather: 'Sunny' },
  ];

  const forecastData = [
    { date: '2025-07-15', actual: 450000, forecast: 460000, lower: 430000, upper: 490000 },
    { date: '2025-07-16', actual: null, forecast: 470000, lower: 440000, upper: 500000 },
    { date: '2025-07-17', actual: null, forecast: 480000, lower: 450000, upper: 510000 },
    { date: '2025-07-18', actual: null, forecast: 465000, lower: 435000, upper: 495000 },
    { date: '2025-07-19', actual: null, forecast: 520000, lower: 490000, upper: 550000 },
    { date: '2025-07-20', actual: null, forecast: 545000, lower: 515000, upper: 575000 },
    { date: '2025-07-21', actual: null, forecast: 580000, lower: 550000, upper: 610000 },
  ];

  const storePerformanceData = [
    { store: 'Store 101', sales: 1200000, orders: 1500, growth: 12.5 },
    { store: 'Store 102', sales: 950000, orders: 1200, growth: 8.3 },
    { store: 'Store 104', sales: 1350000, orders: 1650, growth: 15.2 },
    { store: 'Store 105', sales: 800000, orders: 1000, growth: 5.7 },
  ];

  const categoryData = [
    { name: 'Home Electronics', value: 35, color: '#FFD700' },
    { name: 'Furniture', value: 25, color: '#4169E1' },
    { name: 'Bakery', value: 20, color: '#87CEEB' },
    { name: 'Baby Care', value: 12, color: '#FFA500' },
    { name: 'Others', value: 8, color: '#FFE4B5' },
  ];

  const weatherIcons = {
    Sunny: <Sun className="w-4 h-4 text-yellow-500" />,
    Clear: <Sun className="w-4 h-4 text-blue-400" />,
    Cloudy: <Cloud className="w-4 h-4 text-gray-500" />,
    Rainy: <CloudRain className="w-4 h-4 text-blue-600" />,
    Stormy: <Zap className="w-4 h-4 text-purple-600" />,
  };

  // Add this mapping for Tailwind color classes
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

  // Update StatCard to use colorMap
  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => {
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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const exportData = () => {
    // Simulate export functionality
    const dataStr = JSON.stringify(sampleData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'walmart_forecast_data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="mt-15 min-h-screen bg-white">
      {/* Header */}
{/* Header */}




      {/* Alert Banner */}
      {showAlert && (
        <div className="bg-green-500 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>File uploaded successfully! Processing data...</span>
          </div>
          <button onClick={() => setShowAlert(false)} className="text-white hover:text-gray-200">
            ×
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            {/* Export & Import Buttons - moved here */}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Store</label>
              <select 
                value={selectedStore} 
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Stores</option>
                <option value="101">Store 101</option>
                <option value="102">Store 102</option>
                <option value="104">Store 104</option>
                <option value="105">Store 105</option>
              </select>
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
              <input
                type="checkbox"
                id="holidays"
                checked={includeHolidays}
                onChange={(e) => setIncludeHolidays(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="holidays" className="text-sm text-gray-700">Include Holidays</label>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Sales" 
            value="$4.2M" 
            icon={DollarSign} 
            trend={12.5}
            color="blue"
          />
          <StatCard 
            title="Active Stores" 
            value="4" 
            icon={Store} 
            trend={0}
            color="yellow"
          />
          <StatCard 
            title="Total Orders" 
            value="5,350" 
            icon={ShoppingCart} 
            trend={8.3}
            color="blue"
          />
          <StatCard 
            title="Avg. Order Value" 
            value="$785" 
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
                <LineChart data={sampleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${(value/1000).toFixed(0)}K`, 'Sales']} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#4169E1" strokeWidth={3} />
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
                  <Tooltip formatter={(value) => [`$${(value/1000).toFixed(0)}K`, 'Sales']} />
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
                {sampleData.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.category}</p>
                        <p className="text-xs text-gray-500">Store {item.store}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">${(item.sales/1000).toFixed(0)}K</p>
                      <div className="flex items-center space-x-1">
                        {weatherIcons[item.weather]}
                        <span className="text-xs text-gray-500">{item.weather}</span>
                      </div>
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
                  <Tooltip formatter={(value) => [`$${(value/1000).toFixed(0)}K`, 'Sales']} />
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
                    <span className="font-semibold text-blue-600">$3.52M</span>
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
                    <span className="font-semibold text-blue-600">$14.8M</span>
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
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Raw Data Preview</h3>
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holiday</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weather</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sampleData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.store}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">${(item.sales/1000).toFixed(0)}K</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.holiday}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          {weatherIcons[item.weather]}
                          <span>{item.weather}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;