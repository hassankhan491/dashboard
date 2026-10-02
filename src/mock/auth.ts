import type { Department, ModuleKey, PermissionAction, Role, User } from '../types/auth';

export const MODULES: ModuleKey[] = [
  'dashboard', 'clients', 'orders', 'products', 'purchasing',
  'inventory', 'finance', 'reports', 'users', 'settings', 'audit',
];

const ALL: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'approve', 'export'];
const VIEW: PermissionAction[] = ['view'];

/** Builds a full permission matrix with per-module overrides */
function matrix(
  defaultActions: PermissionAction[],
  overrides: Partial<Record<ModuleKey, PermissionAction[]>> = {},
): Record<ModuleKey, PermissionAction[]> {
  const result = {} as Record<ModuleKey, PermissionAction[]>;
  for (const module of MODULES) {
    result[module] = overrides[module] ?? defaultActions;
  }
  return result;
}

export const mockDepartments: Department[] = [
  { id: 'dep-management', name: 'Management' },
  { id: 'dep-operations', name: 'Operations' },
  { id: 'dep-purchasing', name: 'Purchasing' },
  { id: 'dep-finance', name: 'Finance' },
  { id: 'dep-warehouse', name: 'Warehouse' },
];

export const mockRoles: Role[] = [
  { id: 'role-super-admin', name: 'Super Admin', description: 'Unrestricted access to all modules and settings.', permissions: matrix(ALL), isSystem: true },
  { id: 'role-admin', name: 'Admin', description: 'Full operational access; limited audit access.', permissions: matrix(ALL, { audit: ['view', 'export'] }), isSystem: true },
  {
    id: 'role-manager', name: 'Manager', description: 'Runs day-to-day operations and approvals.',
    permissions: matrix(VIEW, {
      clients: ['view', 'edit'],
      orders: ['view', 'create', 'edit', 'approve', 'export'],
      products: ['view', 'create', 'edit', 'export'],
      purchasing: ['view', 'create', 'edit', 'approve', 'export'],
      inventory: ['view', 'create', 'edit', 'export'],
      finance: ['view', 'export'],
      reports: ['view', 'export'],
    }), isSystem: true,
  },
  {
    id: 'role-department-head', name: 'Department Head', description: 'Owns a department; approves within it.',
    permissions: matrix(VIEW, {
      orders: ['view', 'create', 'edit', 'approve', 'export'],
      products: ['view', 'create', 'edit', 'export'],
      purchasing: ['view', 'create', 'edit', 'approve', 'export'],
      inventory: ['view', 'create', 'edit', 'export'],
    }), isSystem: true,
  },
  {
    id: 'role-team-lead', name: 'Team Lead', description: 'Leads a team; no approvals or deletes.',
    permissions: matrix(VIEW, {
      orders: ['view', 'create', 'edit', 'export'],
      products: ['view', 'create', 'edit'],
      purchasing: ['view', 'create', 'edit'],
      inventory: ['view', 'create', 'edit', 'export'],
    }), isSystem: true,
  },
    {
    id: 'role-staff', name: 'Staff', description: 'Executes daily tasks.',
    permissions: matrix(VIEW, {
      orders: ['view', 'create', 'edit'],
      purchasing: ['view', 'create'],
      inventory: ['view', 'create', 'edit'],
      users: [],
      settings: [],
    }), isSystem: true,
  },
  { id: 'role-viewer', name: 'Viewer', description: 'Read-only access.', permissions: matrix(VIEW), isSystem: true },
];

/** Mock-only extension: real passwords never exist in frontend code later */
export interface MockUser extends User {
  password: string;
}

export const mockUsers: MockUser[] = [
  { id: 'u-1', name: 'Ayesha Khan', email: 'superadmin@ecomops.com', password: 'admin123', role: mockRoles[0], department: mockDepartments[0], clientIds: [], warehouseIds: [], isActive: true, createdAt: '2026-01-05T09:00:00.000Z' },
  { id: 'u-2', name: 'Ahmed Khan', email: 'admin@ecomops.com', password: 'admin123', role: mockRoles[1], department: mockDepartments[0], clientIds: [], warehouseIds: [], isActive: true, createdAt: '2026-01-06T09:00:00.000Z' },
  { id: 'u-3', name: 'Sara Ali', email: 'manager@ecomops.com', password: 'admin123', role: mockRoles[2], department: mockDepartments[1], clientIds: ['client-northstar', 'client-evergreen'], warehouseIds: [], isActive: true, createdAt: '2026-02-01T09:00:00.000Z' },
  { id: 'u-4', name: 'Bilal Ahmed', email: 'viewer@ecomops.com', password: 'admin123', role: mockRoles[6], department: mockDepartments[3], clientIds: ['client-atlas'], warehouseIds: ['wh-khi-1'], isActive: true, createdAt: '2026-03-12T09:00:00.000Z' },
  { id: 'u-5', name: 'Danish Ali', email: 'staff@ecomops.com', password: 'admin123', role: mockRoles[5], department: mockDepartments[4], clientIds: ['client-blueharbor'], warehouseIds: ['wh-khi-1'], isActive: true, createdAt: '2026-04-02T09:00:00.000Z' },
];

/** Temporary assignment options until Clients (Phase 2) & Warehouses (Phase 6) exist */
export interface AssignmentOption {
  id: string;
  name: string;
}

export const mockClientOptions: AssignmentOption[] = [
  { id: 'client-northstar', name: 'Northstar Retail LLC' },
  { id: 'client-evergreen', name: 'Evergreen Commerce Inc.' },
  { id: 'client-atlas', name: 'Atlas Home Goods LLC' },
  { id: 'client-blueharbor', name: 'Blue Harbor Trading LLC' },
];

export const mockWarehouseOptions: AssignmentOption[] = [
  { id: 'wh-khi-1', name: 'Karachi Warehouse 1' },
  { id: 'wh-khi-2', name: 'Karachi Warehouse 2' },
  { id: 'wh-lhr-1', name: 'Lahore Warehouse 1' },
];