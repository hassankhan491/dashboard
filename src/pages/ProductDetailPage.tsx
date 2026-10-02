import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/AuthContext';
import { useBrands, useCategories, useProduct, useProductListings, useRemoveListing } from '../hooks/useProducts';
import { ListingFormDialog } from '../features/products/ListingFormDialog';
import { formatCurrency } from '../utils/format';

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, isLoading } = useProduct(productId);
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: listings } = useProductListings(productId);
  const { can } = useAuth();
  const removeListing = useRemoveListing();

  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) return <Card><p className="text-sm text-muted-foreground">Loading product…</p></Card>;
  if (!product) return <Card className="text-center p-12"><h1 className="text-xl font-bold">Product not found</h1><Link to="/products" className="mt-2 text-sm text-primary hover:underline">Back to products</Link></Card>;

  const category = categories?.find((c) => c.id === product.categoryId)?.name;
  const brand = brands?.find((b) => b.id === product.brandId)?.name;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/products" className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-sm text-muted-foreground">{brand} · {category}</p>
        </div>
      </div>

      {product.description && (
        <Card>
          <h2 className="mb-2 font-semibold">Description</h2>
          <p className="text-sm text-muted-foreground">{product.description}</p>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 font-semibold">Variants (SKUs)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">SKU</th>
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 text-right font-medium">Cost Price</th>
                <th className="py-2 pr-4 text-right font-medium">Selling Price</th>
                <th className="py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {product.variants.map((v) => (
                <tr key={v.id}>
                  <td className="py-2 pr-4 font-mono text-xs">{v.sku}</td>
                  <td className="py-2 pr-4">{v.name}</td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(v.costPrice)}</td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(v.sellingPrice)}</td>
                  <td className="py-2 text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {v.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Marketplace Listings</h2>
          {can('products', 'edit') && (
            <button onClick={() => setDialogOpen(true)} className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Plus size={14} /> Add Listing
            </button>
          )}
        </div>
        {listings && listings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Client</th>
                  <th className="py-2 pr-4 font-medium">Marketplace</th>
                  <th className="py-2 pr-4 font-medium">Variant (SKU)</th>
                  <th className="py-2 pr-4 text-right font-medium">Listing Price</th>
                  <th className="py-2 text-right font-medium">Status</th>
                  {can('products', 'delete') && <th className="py-2 text-right font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {listings.map((listing) => {
                  const variant = product.variants.find((v) => v.id === listing.variantId);
                  return (
                    <tr key={listing.id}>
                      <td className="py-2 pr-4">Client ID: {listing.clientId}</td>
                      <td className="py-2 pr-4">{listing.marketplaceId}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{variant?.sku ?? '—'}</td>
                      <td className="py-2 pr-4 text-right">{formatCurrency(listing.listingPrice)}</td>
                      <td className="py-2 text-right">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          listing.status === 'active' ? 'bg-green-100 text-green-700' :
                          listing.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {listing.status}
                        </span>
                      </td>
                      {can('products', 'delete') && (
                        <td className="py-2 text-right">
                          <button onClick={() => { if(window.confirm('Remove listing?')) removeListing.mutate(listing.id); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No listings yet. Click "Add Listing" to assign this product to a client's store.</p>
        )}
      </Card>

      <ListingFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} productId={product.id} variants={product.variants} />
    </div>
  );
}