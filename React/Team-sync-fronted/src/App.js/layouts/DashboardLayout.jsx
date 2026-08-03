import React from 'react'
import (outlet) from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div>   
        <h1>This is the Dashboard Layout</h1>
        <Outlet />
    </div>
  ) 
}

export default DashboardLayout