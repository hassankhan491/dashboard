// PlaceholderPage.tsx
import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function PlaceholderPage() {
  const location = useLocation();
  const name = location.pathname.replace('/', '') || 'Dashboard';

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
      <Construction className="text-muted-foreground" size={40} />
      <h1 className="mt-4 text-xl font-bold capitalize">{name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This module will be built in its dedicated phase.
      </p>
    </div>
  );
}