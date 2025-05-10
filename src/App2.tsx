import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [{ path: "dashboard", element: <Dashboard /> }],
  },
]);
const App2 = () => {
  return <RouterProvider router={routes} />;
};

export default App2;
