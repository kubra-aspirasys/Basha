import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import ScrollToTop from '@/components/ScrollToTop';
import AuthLayout from '@/components/layouts/AuthLayout';
import AdminLayout from '@/components/layouts/AdminLayout';
import CustomerLayout from '@/components/layouts/CustomerLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Users from '@/pages/Users';
import Menu from '@/pages/Menu';
import Orders from '@/pages/Orders';
import CMS from '@/pages/CMS';
import Payments from '@/pages/Payments';
import Profile from '@/pages/Profile';
import Inquiries from '@/pages/Inquiries';
import Notifications from '@/pages/Notifications';
import Offers from '@/pages/Offers';
import Home from '@/pages/customer/Home';
import CustomerMenu from '@/pages/customer/Menu';
import Cart from '@/pages/customer/Cart';
import Account from '@/pages/customer/Account';
import CustomerOrders from '@/pages/customer/Orders';
import Contact from '@/pages/customer/Contact';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />
          </Route>

          <Route path="/signup" element={<Signup />} />

          {/* Customer routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<CustomerMenu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<CustomerOrders />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<div className="p-8 text-center">Profile Page - Coming Soon</div>} />
          </Route>

          {/* Admin panel routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="menu" element={<Menu />} />
            <Route path="orders" element={<Orders />} />
            <Route path="offers" element={<Offers />} />
            <Route path="cms" element={<CMS />} />
            <Route path="payments" element={<Payments />} />
            <Route path="inquiries" element={<Inquiries />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
      <SonnerToaster position="top-right" expand={true} richColors />
    </ThemeProvider>
  );
}

export default App;
