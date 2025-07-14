import React from 'react';
import { Link } from 'react-router-dom';

const Start = () => {
  const buttons = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Vendor to Warehouse', path: '/VenderToWarehousePage' },
    { label: 'Warehouse to Store', path: '/WarehouseToStore' },
    { label: 'Store to Customer', path: '/StoreToCustomer' },
    { label: 'Feedback & Help', path: '/Feedback' },
    { label: 'Driver', path: '/driver' },
  ];

  return (
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
  );
};

export default Start;
