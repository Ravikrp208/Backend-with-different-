import React from 'react';

import {createBroserRouter, RouterProvider} from 'react-router-dom';

const AppRoutes = () => {
    let router = createBroserRouter([
        {
            path: '/',
            element: <AppRoutes />,
        }
    ])
  return (
    <RouterProvider router={router} />
  )
}