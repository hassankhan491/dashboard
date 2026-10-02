import { mockBrands, mockCategories, mockListings, mockProducts } from '../mock/products';
import type {
  Brand, Category, ListingInput, MarketplaceListing, Product, ProductInput,
} from '../types/product';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** In-memory "databases" — later replaced by REST calls */
let productsDb: Product[] = mockProducts.map((p) => ({ ...p }));
let listingsDb: MarketplaceListing[] = mockListings.map((l) => ({ ...l }));

export const productsService = {
  async getAll(): Promise<Product[]> {
    await delay(250);
    return productsDb.map((p) => ({ ...p }));
  },

  async getById(id: string): Promise<Product | undefined> {
    await delay(150);
    const found = productsDb.find((p) => p.id === id);
    return found ? { ...found } : undefined;
  },

  async getCategories(): Promise<Category[]> {
    await delay(100);
    return [...mockCategories];
  },

  async getBrands(): Promise<Brand[]> {
    await delay(100);
    return [...mockBrands];
  },

  async getListings(): Promise<MarketplaceListing[]> {
    await delay(200);
    return listingsDb.map((l) => ({ ...l }));
  },

  async getListingsByProduct(productId: string): Promise<MarketplaceListing[]> {
    await delay(150);
    return listingsDb.filter((l) => l.productId === productId).map((l) => ({ ...l }));
  },

  async create(input: ProductInput): Promise<Product> {
    await delay(300);
    const product: Product = { ...input, id: `p-${Date.now()}`, createdAt: new Date().toISOString() };
    productsDb = [...productsDb, product];
    return { ...product };
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    await delay(300);
    const existing = productsDb.find((p) => p.id === id);
    if (!existing) throw new Error('Product not found');
    const updated: Product = { ...input, id: existing.id, createdAt: existing.createdAt };
    productsDb = productsDb.map((p) => (p.id === id ? updated : p));
    return { ...updated };
  },

  async createListing(input: ListingInput): Promise<MarketplaceListing> {
    await delay(250);
    const listing: MarketplaceListing = { ...input, id: `lst-${Date.now()}` };
    listingsDb = [...listingsDb, listing];
    return { ...listing };
  },

  async updateListing(
    id: string,
    patch: Partial<Omit<MarketplaceListing, 'id'>>,
  ): Promise<MarketplaceListing> {
    await delay(200);
    const existing = listingsDb.find((l) => l.id === id);
    if (!existing) throw new Error('Listing not found');
    const updated: MarketplaceListing = { ...existing, ...patch };
    listingsDb = listingsDb.map((l) => (l.id === id ? updated : l));
    return { ...updated };
  },

  async removeListing(id: string): Promise<void> {
    await delay(200);
    listingsDb = listingsDb.filter((l) => l.id !== id);
  },
};