"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AuthForm } from './chat/AuthForm';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProfile: UserProfile | null;
  logout: () => Promise<void>;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  airtableGuestId?: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userProfile: null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Get or create user profile in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          // Create new user profile
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
          };
          
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-mono">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black font-mono mb-2">
              AI Security Forum
            </h1>
            <p className="text-black font-mono">
              Sign in to access the conference schedule and chat
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, userProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);