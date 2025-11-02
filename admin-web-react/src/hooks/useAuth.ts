import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getUser, logout as logoutUser, isAdmin, isEmployee } from '@/lib/auth';
import type { User } from '@/types';

export const useAuth = () => {
  const [user, setUserState] = useState<User | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const currentUser = getUser();
    setUserState(currentUser);
  }, []);

  const logout = () => {
    queryClient.clear();
    logoutUser();
  };

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: isAdmin(),
    isEmployee: isEmployee(),
    logout,
  };
};

