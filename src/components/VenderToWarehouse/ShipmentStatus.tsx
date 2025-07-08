// ShipmentStatus.tsx
import React from 'react';

const ShipmentStatus = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-[#0071ce] mb-4">Live Shipment Tracker</h2>
      <ul className="space-y-2 text-sm">
        <li><strong>Shipment ID:</strong> SHP12345 - <span className="text-blue-600">In Transit</span></li>
        <li><strong>ETA:</strong> 2:30 PM</li>
        <li><strong>Truck #:</strong> MH12-XY7890</li>
      </ul>
    </div>
  );
};

export default ShipmentStatus;