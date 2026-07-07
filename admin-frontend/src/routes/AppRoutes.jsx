import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ProductsPage from '../pages/ProductsPage';
import ProductCreatePage from '../pages/ProductCreatePage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import RevenuePage from '../pages/RevenuePage';
import AdminsPage from '../pages/AdminsPage';
import CategoriesPage from '../pages/CategoriesPage';
import BrandsPage from '../pages/BrandsPage';
import OrdersPage from '../pages/OrdersPage';
import UsersPage from '../pages/UsersPage';
import ReviewsPage from '../pages/ReviewsPage';
import CouponsPage from '../pages/CouponsPage';
import SettingsPage from '../pages/SettingsPage';
import ShippingPage from '../pages/ShippingPage';
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductCreatePage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/revenue" element={<RevenuePage />} />
          <Route path="/admins" element={<AdminsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
