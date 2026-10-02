import { mockClients, mockClientPerformance } from '../mock/clients';
import type { Client, ClientContact, ClientInput, ClientPerformanceRow } from '../types/client';
import { MARKETPLACE_FILTER_ALL, type MarketplaceFilter } from '../types/marketplace';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** In-memory "database" — later replaced by REST calls */
let db: Client[] = mockClients.map((client) => ({ ...client }));

export const clientsService = {
  async getAll(): Promise<Client[]> {
    await delay(250);
    return db.map((client) => ({ ...client }));
  },

  async getById(id: string): Promise<Client | undefined> {
    await delay(150);
    const found = db.find((client) => client.id === id);
    return found ? { ...found } : undefined;
  },

  async getPerformance(filter: MarketplaceFilter): Promise<ClientPerformanceRow[]> {
    await delay(200);
    return mockClientPerformance.filter(
      (row) => filter === MARKETPLACE_FILTER_ALL || row.marketplaceId === filter,
    );
  },

  async getPerformanceByClient(
    clientId: string,
    filter: MarketplaceFilter,
  ): Promise<ClientPerformanceRow[]> {
    await delay(200);
    return mockClientPerformance.filter(
      (row) =>
        row.clientId === clientId &&
        (filter === MARKETPLACE_FILTER_ALL || row.marketplaceId === filter),
    );
  },

  async create(input: ClientInput): Promise<Client> {
    await delay(300);
    const client: Client = {
      ...input,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db = [...db, client];
    return { ...client };
  },

  async update(id: string, input: ClientInput): Promise<Client> {
    await delay(300);
    const existing = db.find((client) => client.id === id);
    if (!existing) throw new Error('Client not found');
    const updated: Client = { ...input, id: existing.id, createdAt: existing.createdAt };
    db = db.map((client) => (client.id === id ? updated : client));
    return { ...updated };
  },
  

    async addContact(clientId: string, contact: Omit<ClientContact, 'id'>): Promise<Client> {
    await delay(200);
    const existing = db.find((c) => c.id === clientId);
    if (!existing) throw new Error('Client not found');
    const newContact = { ...contact, id: `c-${Date.now()}` };
    const updated = { ...existing, contacts: [...existing.contacts, newContact] };
    db = db.map((c) => (c.id === clientId ? updated : c));
    return { ...updated };
  },

  async updateContact(clientId: string, contact: ClientContact): Promise<Client> {
    await delay(200);
    const existing = db.find((c) => c.id === clientId);
    if (!existing) throw new Error('Client not found');
    const updated = {
      ...existing,
      contacts: existing.contacts.map((c) => (c.id === contact.id ? contact : c)),
    };
    db = db.map((c) => (c.id === clientId ? updated : c));
    return { ...updated };
  },

  async removeContact(clientId: string, contactId: string): Promise<Client> {
    await delay(200);
    const existing = db.find((c) => c.id === clientId);
    if (!existing) throw new Error('Client not found');
    const updated = {
      ...existing,
      contacts: existing.contacts.filter((c) => c.id !== contactId),
    };
    db = db.map((c) => (c.id === clientId ? updated : c));
    return { ...updated };
  },



};