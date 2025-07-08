import React from 'react';
import VendorShipmentForm from '../components/VenderToWarehouse/VenderShipmentForm';
import WarehouseInfoPanel from '../components/VenderToWarehouse/WarehouseInfoPanel';
import VendorHistoryTable from '../components/VenderToWarehouse/VenderHistoryTable';
import AlertBanner from '../components/VenderToWarehouse/AlertBanner';
import ShipmentStatus from '../components/VenderToWarehouse/ShipmentStatus';


const VendorToWarehousePage = () => {
  return (
    <div className="min-h-screen p-6 bg-blue-50 space-y-6">
      <AlertBanner message="You have 2 incoming shipments today." />
      <div className="grid md:grid-cols-2 gap-6">
        <VendorShipmentForm />
        <WarehouseInfoPanel />
      </div>
      <ShipmentStatus />
      <VendorHistoryTable />
    </div>
  );
};

export default VendorToWarehousePage;
