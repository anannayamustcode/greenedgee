import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="flex flex-col-reverse md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block bg-blue-50 text-[#0071ce] px-4 py-2 rounded-full text-sm font-medium mb-6">
                🌱 Sustainable Logistics Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Empowering <span className="text-[#0071ce]">Sustainable</span> Commerce
              </h1>
              <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl">
                Connecting Vendors to Customers with Speed & Sustainability. 
                Streamline your supply chain while reducing environmental impact.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/getstarted"
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

            {/* Image */}
            <div className="flex-1">
              <div className="relative">
                <img
                  src="/warmat.jpg"
                  alt="Sustainable Logistics"
                  className="w-full max-w-lg mx-auto rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Features */}
      <div className="mt-[-34px] bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-25 h-25 bg-green-800 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-green-600 text-4xl">🌿</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Eco-Friendly</h3>
              <p className="text-gray-600">Reduce carbon footprint with optimized routes and sustainable practices</p>
            </div>
            <div className="text-center">
              <div className="w-25 h-25 bg-blue-300 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-blue-600 text-4xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Fast & Efficient</h3>
              <p className="text-gray-600">Streamlined processes ensure quick delivery times and optimal efficiency</p>
            </div>
            <div className="text-center">
              <div className="w-25 h-25 bg-yellow-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-yellow-600 text-4xl">🔗</span>
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
