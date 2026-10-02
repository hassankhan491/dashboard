import type { ModuleKey, PermissionAction, User } from '../types/auth';

/** Central RBAC check — the ONLY place permission logic lives */
export function hasPermission(
  user: User | null,
  module: ModuleKey,
  action: PermissionAction,
): boolean {
  if (!user) return false;
  return (user.role.permissions[module] ?? []).includes(action);
}