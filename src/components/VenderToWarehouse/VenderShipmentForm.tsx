// VendorShipmentForm.tsx
import React from 'react';

const VendorShipmentForm = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-[#0071ce] mb-4">Shipment Form</h2>
      <form className="space-y-4">
        <input type="text" placeholder="Vendor Name" className="input" />
        <input type="text" placeholder="Shipment ID" className="input" />
        <input type="text" placeholder="Warehouse Code" className="input" />
        <input type="text" placeholder="Product Details" className="input" />
        <input type="date" className="input" />
        <textarea placeholder="Remarks (optional)" className="input" />
        <button type="submit" className="bg-[#ffc220] hover:bg-[#ce7c00] text-white font-semibold px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
};

export default VendorShipmentForm;