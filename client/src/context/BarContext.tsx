import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User, BarWithUser } from "@shared/schema";

interface BarContextType {
  bars: BarWithUser[];
  isLoadingBars: boolean;
  addBar: (bar: {
    content: string;
    explanation?: string;
    category: string;
    tags: string[];
  }) => Promise<void>;
  currentUser: User | null;
  isLoadingUser: boolean;
  login: (username: string, password: string) => Promise<void>;
  signupSimple: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const BarContext = createContext<BarContextType | undefined>(undefined);

export function BarProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: currentUser = null, isLoading: isLoadingUser } = useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await api.getCurrentUser();
      } catch (error) {
        return null;
      }
    },
  });

  // Fetch all bars
  const { data: bars = [], isLoading: isLoadingBars } = useQuery<BarWithUser[]>({
    queryKey: ['bars'],
    queryFn: () => api.getBars(),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      api.login(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['bars'] });
    },
  });

  // Simple signup mutation (no email verification)
  const signupSimpleMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      api.signupSimple(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['bars'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.invalidateQueries({ queryKey: ['bars'] });
    },
  });

  // Create bar mutation
  const createBarMutation = useMutation({
    mutationFn: (data: {
      content: string;
      explanation?: string;
      category: string;
      tags: string[];
    }) => api.createBar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bars'] });
    },
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const signupSimple = async (username: string, password: string) => {
    await signupSimpleMutation.mutateAsync({ username, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const addBar = async (newBarData: {
    content: string;
    explanation?: string;
    category: string;
    tags: string[];
  }) => {
    await createBarMutation.mutateAsync(newBarData);
  };

  return (
    <BarContext.Provider
      value={{
        bars,
        isLoadingBars,
        addBar,
        currentUser,
        isLoadingUser,
        login,
        signupSimple,
        logout,
      }}
    >
      {children}
    </BarContext.Provider>
  );
}

export function useBars() {
  const context = useContext(BarContext);
  if (context === undefined) {
    throw new Error("useBars must be used within a BarProvider");
  }
  return context;
}
