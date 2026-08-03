import React from 'react';

import {createBroserRouter, RouterProvider} from 'react-router-dom';

const AppRoutes = () => {
    let router = createBroserRouter([
      {
        path: "/",
        element: <AppRoutes />,
        children: [
          {
            path: "",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
          },
        ],
      },

      {
        path: "/home",
        element: <DashboardLayout />,
        children: [
            {
                path: "",
                element: <Home />,
            },
        ],
      },

    ]);




  return (
    <RouterProvider router={router} />
  )
}

export default AppRoutes