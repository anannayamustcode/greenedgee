import React from 'react';

import Map from '../components/Map';

const Driver = () => {
  return (
    <div className='mt-15'>
    <Map
      startLabel="Store"
      endLabel="Customer"
      startColor="text-red-600"
      endColor="text-green-600"
    />
    </div>
  );
}

export default Driver;
