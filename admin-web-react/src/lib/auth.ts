import type { User } from '@/types';

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = (): void => {
  localStorage.removeItem('user');
};

export const logout = (): void => {
  removeToken();
  removeUser();
  window.location.href = '/login';
};

export const hasRole = (requiredRoles: string[]): boolean => {
  const user = getUser();
  if (!user || !user.groups) return false;
  return requiredRoles.some((role) => user.groups!.includes(role));
};

export const isAdmin = (): boolean => {
  return hasRole(['ADMIN']);
};

export const isEmployee = (): boolean => {
  return hasRole(['EMPLOYEE']);
};

