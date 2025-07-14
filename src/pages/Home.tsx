import React from 'react';

const Home = () => {
  const buttons = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Vendor to Warehouse', path: '/VenderToWarehousePage' },
    { label: 'Warehouse to Store', path: '/WarehouseToStore' },
    { label: 'Store to Customer', path: '/StoreToCustomer' },
    { label: 'Feedback & Help', path: '/Feedback' },
    { label: "Driver", path: '/driver' },
  ];

  // Mock Link component for demonstration
  const Link = ({ to, children, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="flex flex-col-reverse md:flex-row items-center gap-12">
            {/* Left Text Section */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block bg-blue-50 text-[#0071ce] px-4 py-2 rounded-full text-sm font-medium mb-6">
                🌱 Sustainable Logistics Platform
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Empowering{' '}
                <span className="text-[#0071ce]">Sustainable</span>{' '}
                Commerce
              </h1>
              
              <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl">
                Connecting Vendors to Customers with Speed & Sustainability. 
                Streamline your supply chain while reducing environmental impact.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/signup"
                  className="bg-[#0071ce] text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
                <Link
                  to="/about"
                  className="border-2 border-[#0071ce] text-[#0071ce] px-8 py-4 rounded-full font-semibold hover:bg-[#0071ce] hover:text-white transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Image Section */}
            <div className="flex-1">
              <div className="relative">
                <img
                  src="https://source.unsplash.com/700x500/?logistics,delivery,warehouse"
                  alt="Sustainable Logistics"
                  className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl"
                />
                {/* <div className="absolute -bottom-4 -right-4 bg-[#ffc220] rounded-2xl p-4 shadow-lg"> */}
                  {/* <div className="text-white font-bold text-lg">🚚 Fast</div> */}
                  {/* <div className="text-white text-sm">Delivery</div> */}
                {/* </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-[#0071ce]">GreenEdge</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose your path through our comprehensive logistics ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {buttons.map((btn, index) => (
              <Link
                key={index}
                to={btn.path}
                className="group bg-white border-2 border-gray-200 rounded-2xl p-8 text-center hover:border-[#0071ce] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#0071ce] to-[#ffc220] rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {btn.label.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#0071ce] transition-colors">
                  {btn.label}
                </h3>
                <p className="text-gray-600 text-sm">
                  {btn.label === 'Dashboard' && 'Monitor your logistics operations'}
                  {btn.label === 'Vendor to Warehouse' && 'Manage vendor shipments'}
                  {btn.label === 'Warehouse to Store' && 'Track warehouse distribution'}
                  {btn.label === 'Store to Customer' && 'Handle customer deliveries'}
                  {btn.label === 'Feedback & Help' && 'Get support and share feedback'}
                  {btn.label === 'Driver' && 'Driver management system'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-green-600 text-3xl">🌿</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Eco-Friendly</h3>
              <p className="text-gray-600">Reduce carbon footprint with optimized routes and sustainable practices</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-blue-600 text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Fast & Efficient</h3>
              <p className="text-gray-600">Streamlined processes ensure quick delivery times and optimal efficiency</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-yellow-600 text-3xl">🔗</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Connected</h3>
              <p className="text-gray-600">Seamless integration across the entire supply chain ecosystem</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;