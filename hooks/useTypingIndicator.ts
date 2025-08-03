import { useState, useEffect, useRef } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TypingUser {
  uid: string;
  displayName: string;
  timestamp: number;
}

export function useTypingIndicator(conversationId: string, currentUserId: string) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingRef = useRef<number>(0);

  // Listen for other users typing
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const q = query(
      collection(db, 'typing'),
      where('conversationId', '==', conversationId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const activeTypers: TypingUser[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        // Only show typing indicators for other users and recent activity (within 3 seconds)
        if (data.uid !== currentUserId && (now - data.timestamp) < 3000) {
          activeTypers.push({
            uid: data.uid,
            displayName: data.displayName,
            timestamp: data.timestamp,
          });
        }
      });

      setTypingUsers(activeTypers);
    });

    return unsubscribe;
  }, [conversationId, currentUserId]);

  // Set typing indicator
  const setTyping = async (displayName: string) => {
    if (!conversationId || !currentUserId) return;

    const now = Date.now();
    
    // Throttle typing updates to every 1 second
    if (now - lastTypingRef.current < 1000) return;
    
    lastTypingRef.current = now;

    try {
      await setDoc(doc(db, 'typing', `${conversationId}_${currentUserId}`), {
        uid: currentUserId,
        displayName,
        conversationId,
        timestamp: now,
      });

      setIsTyping(true);

      // Clear typing indicator after 2 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        clearTyping();
      }, 2000);
    } catch (error) {
      console.error('Error setting typing indicator:', error);
    }
  };

  // Clear typing indicator
  const clearTyping = async () => {
    if (!conversationId || !currentUserId) return;

    try {
      await deleteDoc(doc(db, 'typing', `${conversationId}_${currentUserId}`));
      setIsTyping(false);
    } catch (error) {
      console.error('Error clearing typing indicator:', error);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      clearTyping();
    };
  }, []);

  return {
    typingUsers,
    isTyping,
    setTyping,
    clearTyping,
  };
}