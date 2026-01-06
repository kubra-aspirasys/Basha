import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import ScrollToTop from '@/components/ScrollToTop';
import AuthLayout from '@/components/layouts/AuthLayout';
import AdminLayout from '@/components/layouts/AdminLayout';
import CustomerLayout from '@/components/layouts/CustomerLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Users from '@/pages/Users';
import Menu from '@/pages/Menu';
import Orders from '@/pages/Orders';
import Offers from '@/pages/Offers';
import CMS from '@/pages/CMS';
import Payments from '@/pages/Payments';
import Profile from '@/pages/Profile';
import Inquiries from '@/pages/Inquiries';
import Home from '@/pages/customer/Home';
import CustomerMenu from '@/pages/customer/Menu';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          </Route>
          
          {/* Customer routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<CustomerMenu />} />
            <Route path="/cart" element={<div className="p-8 text-center">Cart Page - Coming Soon</div>} />
            <Route path="/orders" element={<div className="p-8 text-center">Orders Page - Coming Soon</div>} />
            <Route path="/contact" element={<div className="p-8 text-center">Contact Page - Coming Soon</div>} />
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
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
