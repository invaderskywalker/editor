// src/hooks/useLogout.ts
import { useUser } from './useUser';

export function useLogout() {
  const { setUser } = useUser();
  return () => {
    localStorage.removeItem('user');
    setUser(null);
  };
}
