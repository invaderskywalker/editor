/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { UserContext, type User, type UserContextValue } from './UserContext';
import { useSocket } from './useSocket';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const socket = useSocket();

  // Sync user presence via socket
  useEffect(() => {
    if (!socket.current || !user) return;

    socket.current.emit('user:join', { user });

    socket.current.on('user:list', (users: User[]) => setActiveUsers(users));
    socket.current.on('user:joined', (users: User[]) => setActiveUsers(users));
    socket.current.on('user:left', (users: User[]) => setActiveUsers(users));

    return () => {
      socket.current?.off('user:list');
      socket.current?.off('user:joined');
      socket.current?.off('user:left');
    };
  }, [socket, user]);

  // Save user in localStorage when changed
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const ctxValue: UserContextValue = {
    user,
    setUser,
    activeUsers,
    setActiveUsers,
  };

  return <UserContext.Provider value={ctxValue}>{children}</UserContext.Provider>;
};
