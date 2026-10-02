import { mockUsers } from '../mock/auth';
import type { AuthSession, User } from '../types/auth';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const FAKE_TOKEN_PREFIX = 'mock-jwt-';

/** Strips the mock-only password before the user object leaves the "API" */
function toSafeUser(mock: (typeof mockUsers)[number]): User {
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

/**
 * Mock auth service.
 * Later: replace bodies with real REST calls (POST /auth/login, GET /auth/me).
 */
export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    await delay(400);
    const found = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!found || !found.isActive) {
      throw new Error('Invalid email or password');
    }
    return { token: FAKE_TOKEN_PREFIX + found.id, user: toSafeUser(found) };
  },

  async me(token: string): Promise<User | null> {
    await delay(200);
    if (!token.startsWith(FAKE_TOKEN_PREFIX)) return null;
    const id = token.replace(FAKE_TOKEN_PREFIX, '');
    const found = mockUsers.find((u) => u.id === id);
    if (!found || !found.isActive) return null;
    return toSafeUser(found);
  },

  async logout(): Promise<void> {
    await delay(100);
  },
    async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await delay(300);
    const found = mockUsers.find((u) => u.id === userId);
    if (!found) throw new Error('User not found');
    if (found.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }
    found.password = newPassword; // mock-only: real backend will handle hashing
  },
};