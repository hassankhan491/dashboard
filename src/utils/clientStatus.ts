import type { Client } from '../types/client';

export const clientStatusStyles: Record<Client['status'], string> = {
  active: 'bg-green-100 text-green-700',
  onboarding: 'bg-amber-100 text-amber-700',
  inactive: 'bg-red-100 text-red-700',
};

