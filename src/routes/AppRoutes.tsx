import { Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ClientDetailPage } from '../pages/ClientDetailPage';
import { ClientsPage } from '../pages/ClientsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { OrdersPage } from '../pages/OrdersPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RolesPage } from '../pages/RolesPage';
import { UsersPage } from '../pages/UsersPage';
import { ProtectedRoute } from './ProtectedRoute';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected — requires a valid session */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:clientId" element={<ClientDetailPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:productId" element={<ProductDetailPage />} />
          <Route path="purchasing" element={<PlaceholderPage />} />
          <Route path="inventory" element={<PlaceholderPage />} />
          <Route path="finance" element={<PlaceholderPage />} />
          <Route path="reports" element={<PlaceholderPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<PlaceholderPage />} />
          <Route path="*" element={<PlaceholderPage />} />
        </Route>
      </Route>
    </Routes>
  );
}