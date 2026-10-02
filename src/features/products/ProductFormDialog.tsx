import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog } from '../../components/ui/Dialog';
import { useBrands, useCategories, useCreateProduct, useUpdateProduct } from '../../hooks/useProducts';
import type { Product, ProductInput } from '../../types/product';

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(2, 'SKU is required (min 2 chars)'),
  costPrice: z.number().min(0, 'Cost must be 0 or greater'),
  sellingPrice: z.number().min(0.01, 'Selling price must be greater than 0'),
  isActive: z.boolean(),
});

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().min(1, 'Brand is required'),
  description: z.string(),
  variants: z.array(variantSchema).min(1, 'At least one variant (SKU) is required'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  product: Product | null; // null = create mode
}

const inputClass =
  'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function ProductFormDialog({ open, onClose, product }: Props) {
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      brandId: '',
      description: '',
      variants: [
        { id: `temp-${Date.now()}`, name: '', sku: '', costPrice: 0, sellingPrice: 0, isActive: true },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  useEffect(() => {
    if (!open) return;
    if (product) {
      reset({
        name: product.name,
        categoryId: product.categoryId,
        brandId: product.brandId,
        description: product.description ?? '',
        variants: product.variants.map((v) => ({ ...v })),
      });
    } else {
      reset({
        name: '',
        categoryId: '',
        brandId: '',
        description: '',
        variants: [
          { id: `temp-${Date.now()}`, name: '', sku: '', costPrice: 0, sellingPrice: 0, isActive: true },
        ],
      });
    }
  }, [open, product, reset]);

  const onSubmit = async (values: ProductFormValues) => {
    const input: ProductInput = {
      name: values.name,
      categoryId: values.categoryId,
      brandId: values.brandId,
      description: values.description || undefined,
      variants: values.variants, // IDs are optional in ProductInput, so this is safe
    };
    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, input });
      } else {
        await createProduct.mutateAsync(input);
      }
      onClose();
    } catch {
      // keep dialog open on failure
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={product ? 'Edit Product' : 'Add Product'} wide>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label htmlFor="prod-name" className="mb-1 block text-sm font-medium">
              Product name
            </label>
            <input
              id="prod-name"
              className={inputClass}
              placeholder="e.g. Ceramic Mug Set"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="prod-category" className="mb-1 block text-sm font-medium">
              Category
            </label>
            <select id="prod-category" className={inputClass} {...register('categoryId')}>
              <option value="">Select category…</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-destructive">{errors.categoryId.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="prod-brand" className="mb-1 block text-sm font-medium">
              Brand
            </label>
            <select id="prod-brand" className={inputClass} {...register('brandId')}>
              <option value="">Select brand…</option>
              {brands?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.brandId && (
              <p className="mt-1 text-xs text-destructive">{errors.brandId.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="prod-desc" className="mb-1 block text-sm font-medium">
              Description (optional)
            </label>
            <input
              id="prod-desc"
              className={inputClass}
              placeholder="e.g. Dishwasher safe stoneware"
              {...register('description')}
            />
          </div>
        </div>

        {/* Dynamic Variants Section */}
        <div className="rounded-md border bg-muted/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Variants (SKUs)</h3>
            <button
              type="button"
              onClick={() =>
                append({
                  id: `temp-${Date.now()}`,
                  name: '',
                  sku: '',
                  costPrice: 0,
                  sellingPrice: 0,
                  isActive: true,
                })
              }
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus size={14} /> Add Variant
            </button>
          </div>

          {errors.variants?.message && (
            <p className="mb-2 text-xs text-destructive">{errors.variants.message}</p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-md border bg-card p-3 md:grid-cols-12">
                <div className="md:col-span-3">
                  <label className="mb-1 block text-xs font-medium">Variant Name</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. 12-piece set"
                    {...register(`variants.${index}.name`)}
                  />
                  {errors.variants?.[index]?.name && (
                    <p className="mt-1 text-[10px] text-destructive">
                      {errors.variants[index].name?.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-3">
                  <label className="mb-1 block text-xs font-medium">SKU</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. NS-MUG-12"
                    {...register(`variants.${index}.sku`)}
                  />
                  {errors.variants?.[index]?.sku && (
                    <p className="mt-1 text-[10px] text-destructive">
                      {errors.variants[index].sku?.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputClass}
                    {...register(`variants.${index}.costPrice`, { valueAsNumber: true })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={inputClass}
                    {...register(`variants.${index}.sellingPrice`, { valueAsNumber: true })}
                  />
                </div>
                <div className="flex items-end gap-2 md:col-span-2">
                  <label className="flex flex-1 items-center gap-2 text-xs">
                    <input type="checkbox" {...register(`variants.${index}.isActive`)} />
                    Active
                  </label>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Remove variant"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : product ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}