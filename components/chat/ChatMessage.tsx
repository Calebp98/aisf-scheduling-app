'use client';

import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  timestamp: Timestamp;
}

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const timestamp = message.timestamp?.toDate();
  const timeString = timestamp ? format(timestamp, 'HH:mm') : '';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
        isOwn 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-200 text-gray-800'
      }`}>
        {!isOwn && (
          <div className="text-xs font-medium mb-1 opacity-75">
            {message.displayName}
          </div>
        )}
        <div className="text-sm">{message.text}</div>
        <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
          {timeString}
        </div>
      </div>
    </div>
  );
}