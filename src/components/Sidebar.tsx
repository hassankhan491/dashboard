import {
  BarChart3, LayoutDashboard, Package, PackageMinus, Settings, ShieldCheck, ShoppingCart,
  Truck, UserCog, Users, Wallet, Warehouse, X, type LucideIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { useAgencyName } from '../hooks/useAgencyName';
import type { ModuleKey } from '../types/auth';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  module: ModuleKey;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard', end: true },
  { to: '/clients', label: 'Clients', icon: Users, module: 'clients' },
  { to: '/orders', label: 'Orders', icon: ShoppingCart, module: 'orders' },
  { to: '/returns', label: 'Returns & Refunds', icon: PackageMinus, module: 'orders' },
  { to: '/products', label: 'Products', icon: Package, module: 'products' },
  { to: '/purchasing', label: 'Purchasing', icon: Truck, module: 'purchasing' },
  { to: '/inventory', label: 'Inventory', icon: Warehouse, module: 'inventory' },
  { to: '/finance', label: 'Finance', icon: Wallet, module: 'finance' },
  { to: '/reports', label: 'Reports', icon: BarChart3, module: 'reports' },
  { to: '/users', label: 'Users', icon: UserCog, module: 'users' },
  { to: '/settings', label: 'Settings', icon: Settings, module: 'settings' },
  { to: '/roles', label: 'Roles & Permissions', icon: ShieldCheck, module: 'users' },
  { to: '/audit', label: 'Audit Logs', icon: ShieldCheck, module: 'settings' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: Props) {
  const { can } = useAuth();
  const agencyName = useAgencyName(); // Hook to listen for name changes
  const visibleItems = navItems.filter((item) => can(item.module, 'view'));

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      )}
      <aside
        className={
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform md:translate-x-0 ' +
          (open ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          {/* Use the agencyName variable here instead of localStorage */}
          <span className="text-lg font-bold">
            {agencyName}
          </span>
          <button className="text-muted-foreground md:hidden" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ' +
                (isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-4 text-xs text-muted-foreground">Phase 1 · Users & Roles</div>
      </aside>
    </>
  );
}