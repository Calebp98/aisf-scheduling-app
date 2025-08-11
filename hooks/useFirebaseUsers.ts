"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string;
}

export function useFirebaseUsers() {
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get all user profiles from Firestore
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      
      const firebaseUsers: FirebaseUser[] = [];
      userSnapshot.forEach((doc) => {
        const userData = doc.data();
        firebaseUsers.push({
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName
        });
      });
      
      // Sort by display name
      firebaseUsers.sort((a, b) => a.displayName.localeCompare(b.displayName));
      
      setUsers(firebaseUsers);
      console.log(`👥 Loaded ${firebaseUsers.length} Firebase users`);
      
    } catch (error) {
      console.error("Error loading Firebase users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    refreshUsers: loadUsers
  };
}