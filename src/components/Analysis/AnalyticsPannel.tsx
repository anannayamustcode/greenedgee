import React from 'react';

const AnalyticsPanel = () => {
  return (
    <div className="w-2/3 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Analysis</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Replace this with chart or real analysis */}
        <p className="text-gray-600">
          • Renewable usage trend over past 6 months <br />
          • Peak usage hours <br />
          • Recommendations to reduce carbon footprint
        </p>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
