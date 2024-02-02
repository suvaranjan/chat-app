import { Outlet, createBrowserRouter } from "react-router-dom";
import { useColorMode } from "@chakra-ui/react";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Navbar from "./components/Others/NavBar";
import Footer from "./components/Others/Footer";
import Dashboard from "./components/dashboard/Dashboard";
import Friends from "./components/friends/Friends";
import { Toaster } from "react-hot-toast";
export const router = createBrowserRouter([
  {
    element: <NavLayout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/dashboard/friends",
        element: <Friends />,
      },
    ],
  },
]);

function NavLayout() {
  const { colorMode } = useColorMode();

  return (
    <>
      <div className="w-full">
        <Toaster
          toastOptions={{
            style: {
              background: colorMode === "dark" ? "#2D3748" : "#FAFAFA",
              color: colorMode === "dark" ? "#FAFAFA" : "#000",
            },
          }}
        />
        <Navbar />
        <Outlet />
        <Footer />
      </div>
    </>
  );
}
