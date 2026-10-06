import type { ReturnAddress } from '../types/order';

export const mockReturnAddresses: ReturnAddress[] = [
  {
    id: 'ra-1',
    label: 'NJ Warehouse (Default)',
    addressLine: '45 Logistics Way, Newark, NJ 07102',
    city: 'Newark',
    country: 'USA',
    isDefault: true,
  },
  {
    id: 'ra-2',
    label: 'LA Return Center',
    addressLine: '880 Distribution Blvd, Commerce, CA 90040',
    city: 'Commerce',
    country: 'USA',
    isDefault: false,
  },
];