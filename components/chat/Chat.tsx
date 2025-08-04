'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  where 
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { AuthForm } from './AuthForm';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { UserList } from './UserList';
import { TypingIndicator } from './TypingIndicator';
import { getConversationId, isDirectMessage } from '@/lib/chatHelpers';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';

interface Message {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  timestamp: Timestamp;
  conversationId: string;
}

interface User {
  uid: string;
  displayName: string;
  email: string;
}

export function Chat() {
  const [user, loading] = useAuthState(auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User>({ uid: 'global', displayName: 'Global Chat', email: '' });
  const [conversationId, setConversationId] = useState('global');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { typingUsers, setTyping, clearTyping } = useTypingIndicator(
    conversationId,
    user?.uid || ''
  );

  useEffect(() => {
    if (!user) return;

    let q;
    
    if (conversationId === 'global') {
      // For global chat, get messages without conversationId or with conversationId = 'global'
      q = query(
        collection(db, 'messages'),
        orderBy('timestamp', 'asc')
      );
    } else {
      // For private chats, filter by conversationId
      q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      // Filter messages on the client side if needed
      if (conversationId === 'global') {
        messageData = messageData.filter(msg => !msg.conversationId || msg.conversationId === 'global');
      }
      
      setMessages(messageData);
    }, (error) => {
      console.error('Error fetching messages:', error);
      // Fallback to simpler query if composite index isn't ready
      if (error.code === 'failed-precondition') {
        const fallbackQuery = query(
          collection(db, 'messages'),
          orderBy('timestamp', 'asc')
        );
        
        const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
          let messageData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Message[];
          
          // Filter on client side
          messageData = messageData.filter(msg => {
            if (conversationId === 'global') {
              return !msg.conversationId || msg.conversationId === 'global';
            }
            return msg.conversationId === conversationId;
          });
          
          setMessages(messageData);
        });
        
        return fallbackUnsubscribe;
      }
    });

    return unsubscribe;
  }, [user, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    const newConversationId = selectedUser.uid === 'global' 
      ? 'global' 
      : getConversationId(user!.uid, selectedUser.uid);
    setConversationId(newConversationId);
  };

  const sendMessage = async (text: string) => {
    if (!user || !text.trim()) return;

    await addDoc(collection(db, 'messages'), {
      text: text.trim(),
      uid: user.uid,
      displayName: user.displayName || user.email,
      email: user.email,
      timestamp: serverTimestamp(),
      conversationId: conversationId,
    });
  };

  const handleTyping = () => {
    if (user) {
      setTyping(user.displayName || user.email || 'User');
    }
  };

  const handleStopTyping = () => {
    clearTyping();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="flex h-96 border border-gray-300 rounded-lg overflow-hidden">
      <UserList 
        onSelectUser={handleUserSelect}
        selectedUserId={selectedUser.uid}
      />
      
      <div className="flex flex-col flex-1">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {selectedUser.uid === 'global' ? 'Global Chat' : `Chat with ${selectedUser.displayName}`}
          </h2>
          <p className="text-sm text-gray-600">
            {selectedUser.uid === 'global' 
              ? 'Everyone can see these messages' 
              : 'Private conversation'
            }
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isOwn={message.uid === user.uid}
            />
          ))}
          <TypingIndicator typingUsers={typingUsers} />
          <div ref={messagesEndRef} />
        </div>
        
        <ChatInput 
          onSendMessage={sendMessage}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
        />
      </div>
    </div>
  );
}