// AlertBanner.tsx
import React from 'react';

const AlertBanner = ({ message }: { message: string }) => {
  return (
    <div className="bg-yellow-100 text-yellow-800 border border-yellow-400 px-4 py-3 rounded shadow">
      <p>{message}</p>
    </div>
  );
};

export default AlertBanner;