import {
  flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  useReactTable, type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Plus, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { ProductFormDialog } from '../features/products/ProductFormDialog';
import { useAuth } from '../hooks/AuthContext';
import { useMarketplaceFilter } from '../hooks/MarketplaceFilterContext';
import { useBrands, useCategories, useListings, useProducts } from '../hooks/useProducts';
import type { Product } from '../types/product';
import { MARKETPLACE_FILTER_ALL } from '../types/marketplace';

export function ProductsPage() {
  const { can } = useAuth();
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: listings } = useListings();
  
  // Get the global marketplace filter
  const { filter } = useMarketplaceFilter();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 1. Filter listings based on the global marketplace filter
  const filteredListings = useMemo(() => {
    if (filter === MARKETPLACE_FILTER_ALL) return listings ?? [];
    return (listings ?? []).filter((l) => l.marketplaceId === filter);
  }, [listings, filter]);

  // 2. Count active listings per product (only for the filtered marketplace)
  const activeListingsByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const listing of filteredListings) {
      if (listing.status === 'active') {
        map.set(listing.productId, (map.get(listing.productId) ?? 0) + 1);
      }
    }
    return map;
  }, [filteredListings]);

  // 3. Determine which products are visible based on the filter
  const visibleProductIds = useMemo(() => {
    if (filter === MARKETPLACE_FILTER_ALL) return null; // null means show all
    const ids = new Set<string>();
    for (const listing of filteredListings) {
      ids.add(listing.productId);
    }
    return ids;
  }, [filteredListings, filter]);

  // 4. Filter the products array
  const filteredProducts = useMemo(() => {
    if (!visibleProductIds) return products ?? [];
    return (products ?? []).filter((p) => visibleProductIds.has(p.id));
  }, [products, visibleProductIds]);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Product <ArrowUpDown size={14} />
          </button>
        ),
        cell: ({ row }) => (
          <Link to={`/products/${row.original.id}`} className="font-medium hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        cell: ({ row }) => categories?.find((c) => c.id === row.original.categoryId)?.name ?? '—',
      },
      {
        id: 'brand',
        header: 'Brand',
        cell: ({ row }) => brands?.find((b) => b.id === row.original.brandId)?.name ?? '—',
      },
      {
        id: 'variants',
        header: () => <span className="block text-right">Variants (SKUs)</span>,
        cell: ({ row }) => (
          <span className="block text-right">{row.original.variants.length}</span>
        ),
      },
      {
        id: 'listings',
        header: () => <span className="block text-right">Active Listings</span>,
        cell: ({ row }) => {
          const count = activeListingsByProduct.get(row.original.id) ?? 0;
          return (
            <span className="block text-right font-medium">
              {count}
            </span>
          );
        },
      },
    ],
    [categories, brands, activeListingsByProduct],
  );

  const table = useReactTable({
    data: filteredProducts, // Use filtered products here
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!can('products', 'view')) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <ShieldAlert className="text-muted-foreground" size={40} />
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role does not allow viewing products.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products & Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Master product catalog, variants (SKUs), and marketplace listings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products…"
            className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {can('products', 'create') && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setDialogOpen(true);
              }}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus size={16} /> Add Product
            </button>
          )}
        </div> 
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b text-left text-muted-foreground">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {isLoading && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    Loading products…
                  </td>
                </tr>
              )}
              {!isLoading && table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    No products found for this marketplace.
                  </td>
                </tr>
              )}
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        product={editingProduct}
      />
    </div>
  );
}