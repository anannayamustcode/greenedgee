import React from 'react';

const About = () => {
  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-yellow-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">
            Green<span className="text-yellow-500">Edge</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-blue-500 mx-auto mb-6"></div>
          <p className="text-xl text-blue-700 font-light">
            Smart Environmental Analytics for a Sustainable Future
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-8 text-lg">
              Our project, <strong className="text-blue-900">GreenEdge</strong>, is a smart environmental analytics dashboard designed to help businesses monitor, visualize, and optimize their carbon footprint and sustainability efforts.
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-8 text-lg">
              By leveraging advanced data processing, forecasting models (like Prophet), and rich visualizations, the platform provides insights into CO₂ emissions, energy consumption trends, and predictive forecasts.
            </p>
            
            <p className="text-gray-700 leading-relaxed text-lg">
              Users can explore interactive charts, download comprehensive reports, and make data-driven decisions toward greener operations. Built with modern web technologies and a robust backend, GreenEdge empowers organizations to take actionable steps toward a more sustainable future.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-blue-50 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Monitor</h3>
            <p className="text-blue-700">Track carbon footprint and sustainability metrics in real-time</p>
          </div>
          
          <div className="bg-yellow-50 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Visualize</h3>
            <p className="text-blue-700">Interactive charts and rich data visualizations for insights</p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Optimize</h3>
            <p className="text-blue-700">Make data-driven decisions for greener operations</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-500 to-yellow-500 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Go Green?</h2>
            <p className="text-lg mb-6 opacity-90">
              Start your journey toward a more sustainable future with GreenEdge
            </p>
            <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;