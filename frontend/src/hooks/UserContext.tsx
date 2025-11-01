/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext } from "react";

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  activeUsers: User[];
  setActiveUsers: (users: User[]) => void;
}

export const UserContext = createContext<UserContextValue | undefined>(undefined);

export function useUserContext(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserContext must be used within a UserProvider");
  return context;
}
