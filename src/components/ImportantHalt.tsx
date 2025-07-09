import React from 'react';
import { Link } from 'react-router-dom';

const ImportantHalt = () => {
  const buttons = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Vendor to Warehouse', path: '/VenderToWarehousePage' },
    { label: 'Warehouse to Store', path: '/WarehouseToStore' },
    { label: 'Store to Customer', path: '/StoreToCustomer' },
    { label: 'Feedback & Help', path: '/Feedback' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-5">
      <h2 className="text-3xl font-bold text-[#0071ce] mb-10">Welcome to GreenEdge</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {buttons.map((btn, index) => (
          <Link
            key={index}
            to={btn.path}
            className="bg-[#ffc220] text-white font-semibold px-6 py-4 rounded-lg shadow-md text-center hover:bg-[#ce7c00] transition"
          >
            {btn.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ImportantHalt;
