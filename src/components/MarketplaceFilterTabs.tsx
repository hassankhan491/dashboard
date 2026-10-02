import { useMarketplaceFilter } from '../hooks/MarketplaceFilterContext';
import { MARKETPLACE_FILTER_ALL, type Marketplace } from '../types/marketplace';

interface Props {
  marketplaces: Marketplace[];
}

export function MarketplaceFilterTabs({ marketplaces }: Props) {
  const { filter, setFilter } = useMarketplaceFilter();

  const tabs = [
    { id: MARKETPLACE_FILTER_ALL, name: 'All', color: undefined as string | undefined },
    ...marketplaces.map((m) => ({ id: m.id, name: m.name, color: m.color as string | undefined })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const active = filter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={
              'flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ' +
              (active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground')
            }
          >
            {tab.color && !active && (
              <span
                className="mr-2 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: tab.color }}
              />
            )}
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}