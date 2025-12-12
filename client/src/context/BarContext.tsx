import React, { createContext, useContext, useState, ReactNode } from "react";
import { Bar, MOCK_BARS, CURRENT_USER, User } from "@/lib/mockData";

interface BarContextType {
  bars: Bar[];
  addBar: (bar: Omit<Bar, "id" | "author" | "likes" | "comments" | "timestamp">) => void;
  currentUser: User;
}

const BarContext = createContext<BarContextType | undefined>(undefined);

export function BarProvider({ children }: { children: ReactNode }) {
  const [bars, setBars] = useState<Bar[]>(MOCK_BARS);

  const addBar = (newBarData: Omit<Bar, "id" | "author" | "likes" | "comments" | "timestamp">) => {
    const newBar: Bar = {
      ...newBarData,
      id: Math.random().toString(36).substr(2, 9),
      author: CURRENT_USER,
      likes: 0,
      comments: 0,
      timestamp: "Just now",
    };
    
    setBars((prev) => [newBar, ...prev]);
  };

  return (
    <BarContext.Provider value={{ bars, addBar, currentUser: CURRENT_USER }}>
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
