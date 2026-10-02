import {
  mockClientOptions, mockDepartments, mockRoles, mockUsers, mockWarehouseOptions,
  type AssignmentOption, type MockUser,
} from '../mock/auth';
import type { Department, Role, User } from '../types/auth';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface UserInput {
  name: string;
  email: string;
  roleId: string;
  departmentId?: string;
  clientIds: string[];
  warehouseIds: string[];
  isActive: boolean;
}

function toSafeUser(mock: MockUser): User {
  return {
    id: mock.id,
    name: mock.name,
    email: mock.email,
    role: mock.role,
    department: mock.department,
    clientIds: mock.clientIds,
    warehouseIds: mock.warehouseIds,
    isActive: mock.isActive,
    createdAt: mock.createdAt,
  };
}

/** In-memory "database" — later replaced by REST calls to the NestJS backend */
let db: User[] = mockUsers.map(toSafeUser);

export const usersService = {
  async getAll(): Promise<User[]> {
    await delay(250);
    return [...db];
  },

  async getRoles(): Promise<Role[]> {
    await delay(150);
    return [...mockRoles];
  },

  async getDepartments(): Promise<Department[]> {
    await delay(150);
    return [...mockDepartments];
  },

  async getClientOptions(): Promise<AssignmentOption[]> {
    await delay(150);
    return [...mockClientOptions];
  },

  async getWarehouseOptions(): Promise<AssignmentOption[]> {
    await delay(150);
    return [...mockWarehouseOptions];
  },

  async create(input: UserInput): Promise<User> {
    await delay(300);
    const role = mockRoles.find((r) => r.id === input.roleId);
    if (!role) throw new Error('Invalid role');
    const user: User = {
      id: `u-${Date.now()}`,
      name: input.name,
      email: input.email,
      role,
      department: mockDepartments.find((d) => d.id === input.departmentId),
      clientIds: input.clientIds,
      warehouseIds: input.warehouseIds,
      isActive: input.isActive,
      createdAt: new Date().toISOString(),
    };
    db = [...db, user];
    return user;
  },

  async update(id: string, input: UserInput): Promise<User> {
    await delay(300);
    const existing = db.find((u) => u.id === id);
    if (!existing) throw new Error('User not found');
    const role = mockRoles.find((r) => r.id === input.roleId);
    if (!role) throw new Error('Invalid role');
    const updated: User = {
      id: existing.id,
      name: input.name,
      email: input.email,
      role,
      department: mockDepartments.find((d) => d.id === input.departmentId),
      clientIds: input.clientIds,
      warehouseIds: input.warehouseIds,
      isActive: input.isActive,
      createdAt: existing.createdAt,
    };
    db = db.map((u) => (u.id === id ? updated : u));
    return updated;
  },

  async remove(id: string): Promise<void> {
    await delay(250);
    db = db.filter((u) => u.id !== id);
  },

  async setActive(id: string, isActive: boolean): Promise<User> {
    await delay(200);
    const existing = db.find((u) => u.id === id);
    if (!existing) throw new Error('User not found');
    const updated: User = { ...existing, isActive };
    db = db.map((u) => (u.id === id ? updated : u));
    return updated;
  },
};