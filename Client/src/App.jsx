import { Routes, Route } from "react-router-dom";
import RouterSelector from "./lib/RouterSelector";
import Layout from "./components/Layout";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard"; // Updated import name
import Signout from "./Auth/Signout";
import PageNotFound from "../src/pages/PageNotFound";
import OtpInput from "./Auth/Verifyotp.jsx";
import Settings from "./pages/Settings";
import GoogleRedirect from "./Auth/GoogleRedirect";
import ForgotPassword from "./Auth/ForgotPassword";
import ResetPassword from "./Auth/ResetPassword";
import { SocketProvider } from "./contexts/SocketContext";
import FriendsPage from "./pages/FriendsPage.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Delete from "./Auth/DeleteAccount";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthLayout from "./components/AuthLayout";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import { ToastProvider } from "./contexts/ToastContext";
import UserInitializer from "./contexts/userInitializer"

function App() {
  const queryClient = new QueryClient();

  return (
    <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <UserInitializer>
          <SocketProvider>
            <RouterSelector>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route
                    path="dashboard"
                    element={<Dashboard isCurrentUser={true} />}
                  />
                  <Route
                    path="user/:userId"
                    element={<Dashboard isCurrentUser={false} />}
                  />
                  <Route path="settings/" element={<Settings />} />
                  <Route path="friends" element={<FriendsPage />} />
                  <Route path="*" element={<PageNotFound />} />
                </Route>

                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<SignUp />} />
                  <Route path="verify" element={<OtpInput />} />
                  <Route path="delete-account" element={<Delete />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="verify-reset-otp" element={<OtpInput />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                </Route>

                <Route
                  path="/auth/google/callback"
                  element={<GoogleRedirect />}
                />

                <Route path="/signout" element={<Signout />} />
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </RouterSelector>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              theme="light"
            />
          </SocketProvider>
          </UserInitializer>
        </QueryClientProvider>
    </ToastProvider>
  );
}

export default App;
