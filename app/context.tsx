"use client";
import { createContext } from "react";
import { useAuth } from "@/components/AuthProvider";

// Create context provider that wraps Firebase auth
export const UserContext = createContext<{user: string | null, setUser: ((u:string | null) => void) | null}>({user: null, setUser: null});

export function Context({children}: Readonly<{children: React.ReactNode}>) {
  const { user: firebaseUser, userProfile } = useAuth();
  
  // For compatibility with existing code, we provide the Firebase UID as the user ID
  const user = firebaseUser?.uid || null;
  
  // setUser is no longer needed since auth is handled by Firebase
  const setUser = null;
  
  return (
    <UserContext.Provider value={{user, setUser}}>
      {children}
    </UserContext.Provider>
  );
}