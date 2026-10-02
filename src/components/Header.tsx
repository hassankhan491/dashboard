import { LogOut, Menu } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { useMarketplaces } from '../hooks/useMarketplaces';
import { MarketplaceFilterTabs } from './MarketplaceFilterTabs';

interface Props {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: Props) {
  const location = useLocation();
  const { data: marketplaces } = useMarketplaces();
  const { user, logout } = useAuth();

  const initials = user
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  // Hide tabs on pages where marketplace filtering doesn't apply
  const hideTabs = ['/purchasing', '/users', '/roles', '/settings', '/profile'].some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <button className="text-muted-foreground md:hidden" onClick={onMenuClick}>
        <Menu size={20} />
      </button>
      
      <div className="flex-1">
        {/* Only render tabs if we are NOT on an admin/purchasing page */}
        {!hideTabs && marketplaces && <MarketplaceFilterTabs marketplaces={marketplaces} />}
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <NavLink
            to="/profile"
            className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-accent"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs leading-tight text-muted-foreground">{user.role.name}</p>
            </div>
          </NavLink>
          <button
            onClick={() => void logout()}
            title="Logout"
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </header>
  );
}