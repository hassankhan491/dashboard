/** Permission actions used across the RBAC matrix */
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';

/** Business modules that can be protected by permissions */
export type ModuleKey =
  | 'dashboard'
  | 'clients'
  | 'orders'
  | 'products'
  | 'purchasing'
  | 'inventory'
  | 'finance'
  | 'reports'
  | 'users'
  | 'settings'
  | 'audit';

export type RoleName =
  | 'Super Admin'
  | 'Admin'
  | 'Manager'
  | 'Department Head'
  | 'Team Lead'
  | 'Staff'
  | 'Viewer';

export interface Role {
  id: string;
  name: RoleName;
  description: string;
  /** module -> allowed actions */
  permissions: Record<ModuleKey, PermissionAction[]>;
  isSystem: boolean;
}

export interface Department {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: Department;
  /** Empty array = no restriction (access to ALL clients) */
  clientIds: string[];
  /** Empty array = no restriction (access to ALL warehouses) */
  warehouseIds: string[];
  isActive: boolean;
  createdAt: string;
}

export interface AuthSession {
  token: string; // mock JWT — real JWT once backend exists
  user: User;
}