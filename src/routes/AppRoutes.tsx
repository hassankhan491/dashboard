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
import { ReturnsPage } from '../pages/ReturnsPage';
import { PurchasingPage } from '../pages/PurchasingPage';
import { PODetailPage } from '../pages/PODetailPage';
import { InventoryPage } from '../pages/InventoryPage';
import { FinancePage } from '../pages/FinancePage';
import { ReportsPage } from '../pages/ReportsPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { SettingsPage } from '../pages/SettingsPage';

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
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:productId" element={<ProductDetailPage />} />
          <Route path="purchasing" element={<PurchasingPage />} />
          <Route path="purchasing/:poId" element={<PODetailPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="audit" element={<AuditLogsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<PlaceholderPage />} />
        </Route>
      </Route>
    </Routes>
  );
}