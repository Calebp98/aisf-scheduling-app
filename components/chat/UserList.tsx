'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { UserIcon } from '@heroicons/react/24/outline';

interface User {
  uid: string;
  displayName: string;
  email: string;
  lastSeen?: Date;
}

interface UserListProps {
  onSelectUser: (user: User) => void;
  selectedUserId?: string;
}

export function UserList({ onSelectUser, selectedUserId }: UserListProps) {
  const [currentUser] = useAuthState(auth);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    // Get all users who have sent messages (excluding current user)
    const fetchUsers = async () => {
      const messagesQuery = query(collection(db, 'messages'));
      const snapshot = await getDocs(messagesQuery);
      
      const userMap = new Map<string, User>();
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.uid !== currentUser.uid) {
          userMap.set(data.uid, {
            uid: data.uid,
            displayName: data.displayName || data.email || 'Unknown User',
            email: data.email || '',
          });
        }
      });
      
      setUsers(Array.from(userMap.values()));
    };

    fetchUsers();
  }, [currentUser]);

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4">Users</h3>
      
      <div className="space-y-2">
        {/* Global Chat Option */}
        <button
          onClick={() => onSelectUser({ uid: 'global', displayName: 'Global Chat', email: '' })}
          className={`w-full text-left p-3 rounded-lg transition-colors ${
            selectedUserId === 'global' 
              ? 'bg-blue-100 border border-blue-300' 
              : 'bg-white hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium">Global Chat</div>
              <div className="text-sm text-gray-500">Everyone</div>
            </div>
          </div>
        </button>
        
        {/* Individual Users */}
        {users.map((user) => (
          <button
            key={user.uid}
            onClick={() => onSelectUser(user)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              selectedUserId === user.uid 
                ? 'bg-blue-100 border border-blue-300' 
                : 'bg-white hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium">{user.displayName}</div>
                <div className="text-sm text-gray-500">Direct Message</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No other users found</p>
          <p className="text-xs">Users appear after sending messages</p>
        </div>
      )}
    </div>
  );
}