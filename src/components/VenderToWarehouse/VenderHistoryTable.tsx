// VendorHistoryTable.tsx
import React from 'react';

const VendorHistoryTable = () => {
  return (
    <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-[#0071ce] mb-4">Recent Shipments</h2>
      <table className="table-auto w-full text-sm">
        <thead className="bg-[#0071ce] text-white">
          <tr>
            <th className="px-4 py-2">Vendor</th>
            <th className="px-4 py-2">Product</th>
            <th className="px-4 py-2">Qty</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr className="text-center">
            <td className="px-4 py-2">ABC Corp</td>
            <td className="px-4 py-2">Widgets</td>
            <td className="px-4 py-2">100</td>
            <td className="px-4 py-2 text-green-600">Delivered</td>
            <td className="px-4 py-2">2025-07-08</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default VendorHistoryTable;