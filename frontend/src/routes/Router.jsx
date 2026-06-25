import MainLayout from "@/layouts/MainLayout";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerifyOtp from "@/pages/auth/VerifyOtp";
import CreateServices from "@/pages/events/services/CreateService";
import Home from "@/pages/Home";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ProfilePageSettings from "@/pages/ProfilePageSettings";
import PrivateRoute from "./PrivateRoute";
import NotFound from "@/pages/NotFound";
import ProfilePage from "@/pages/ProfilePage";
import Events from "@/pages/events/Events";
import DetailsPageWrapper from "@/pages/events/DetailsPageWrapper";
import EditService from "@/pages/events/services/EditService";
import GetReportMessages from "@/components/events/reports/GetReportMessages";
import BuyerOrdersPage from "@/pages/orders/BuyerOrdersPage";
import SellerOrdersPage from "@/pages/orders/SellerOrdersPage";
import CreateOrderPage from "@/pages/orders/CreateOrderPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/verify-otp",
        element: <VerifyOtp />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },

      // events
      {
        path: "/events",
        element: <Events />,
      },
      {
        path: "/events/:slug",
        element: <DetailsPageWrapper />,
      },
      {
        path: "/events/create",
        element: (
          <PrivateRoute allowedRoles={["seller", "admin"]}>
            <CreateServices />
          </PrivateRoute>
        ),
      },
      {
        path: "/events/:slug/edit",
        element: (
          <PrivateRoute allowedRoles={["seller", "admin"]}>
            <EditService />
          </PrivateRoute>
        ),
      },
      {
        path: "/profile/:slug",
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: "/settings/:slug",
        element: (
          <PrivateRoute>
            <ProfilePageSettings />
          </PrivateRoute>
        ),
      },
      {
        path: "/user/:slug/reports",
        element: (
          <PrivateRoute>
            <GetReportMessages />
          </PrivateRoute>
        ),
      },

      // orders
      {
        path: "/user/:slug/orders",
        element: (
          <PrivateRoute>
            <BuyerOrdersPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/seller/:slug/orders",
        element: (
          <PrivateRoute allowedRoles={["seller", "admin"]}>
            <SellerOrdersPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/events/:slug/order/create",
        element: (
          <PrivateRoute>
            <CreateOrderPage />
          </PrivateRoute>
        ),
      },

      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
