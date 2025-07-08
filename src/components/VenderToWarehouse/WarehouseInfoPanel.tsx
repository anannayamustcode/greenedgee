// WarehouseInfoPanel.tsx
import React from 'react';

const WarehouseInfoPanel = () => {
  return (
    <div className="bg-[#0071ce] text-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-3">Warehouse Overview</h2>
      <ul className="space-y-1">
        <li>Location: Pune, MH</li>
        <li>Capacity: 80% used</li>
        <li>Active Deliveries: 5</li>
      </ul>
    </div>
  );
};

export default WarehouseInfoPanel;