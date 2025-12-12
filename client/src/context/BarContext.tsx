import React, { createContext, useContext, useState, ReactNode } from "react";
import { Bar, MOCK_BARS, CURRENT_USER, User } from "@/lib/mockData";

interface BarContextType {
  bars: Bar[];
  addBar: (bar: Omit<Bar, "id" | "author" | "likes" | "comments" | "timestamp">) => void;
  currentUser: User | null;
  login: (credentials: any) => void;
  signup: (credentials: any) => void;
  logout: () => void;
}

const BarContext = createContext<BarContextType | undefined>(undefined);

export function BarProvider({ children }: { children: ReactNode }) {
  const [bars, setBars] = useState<Bar[]>(MOCK_BARS);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Start logged out for demo

  const login = (credentials: any) => {
    // Mock login logic
    setCurrentUser(CURRENT_USER);
  };

  const signup = (credentials: any) => {
    // Mock signup logic
    const newUser: User = {
      id: "new-user",
      username: credentials.username || "NewRapper",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop",
      verified: false
    };
    setCurrentUser(newUser);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addBar = (newBarData: Omit<Bar, "id" | "author" | "likes" | "comments" | "timestamp">) => {
    if (!currentUser) return;
    
    const newBar: Bar = {
      ...newBarData,
      id: Math.random().toString(36).substr(2, 9),
      author: currentUser,
      likes: 0,
      comments: 0,
      timestamp: "Just now",
    };
    
    setBars((prev) => [newBar, ...prev]);
  };

  return (
    <BarContext.Provider value={{ bars, addBar, currentUser, login, signup, logout }}>
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
