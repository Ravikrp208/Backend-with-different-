import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import About from "./About";
import Contact from "./Contact";
import Login from "./Login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default router;
