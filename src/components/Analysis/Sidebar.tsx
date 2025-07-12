import React from 'react';
import CircularProgress from './CircularProgress';

const Sidebar = () => {
  return (
    <div className="w-1/3 p-6 bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-green-700">GreenEdge Usage</h2>
      <div className="mb-6 flex justify-center">
        <CircularProgress percentage={75} />
      </div>
      <div className="mt-6">
        <h3 className="text-md font-medium text-gray-700">Carbon Emission</h3>
        <p className="text-2xl font-bold text-red-500 mt-2">1.24 tons CO₂</p>
        <p className="text-sm text-gray-500">This month</p>
      </div>
    </div>
  );
};

export default Sidebar;
