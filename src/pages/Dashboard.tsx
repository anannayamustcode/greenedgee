import React from 'react';
import Map from '../components/Map';
import Sidebar from '../components/Analysis/Sidebar';
import CircularProgress from '../components/Analysis/CircularProgress';
import AnalyticsPanel from '../components/Analysis/AnalyticsPannel';



const Dashboard = () => {
  return (
    <div className='mt-10'>
      <Sidebar>
      <CircularProgress/>
      <AnalyticsPanel/>

      </Sidebar>
      
    
      
    </div>
  );
}

export default Dashboard;
