import { Chat } from '@/components/chat/Chat';

export default function ChatPage() {
  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 font-mono text-black">Conference Chat</h1>
      <Chat />
    </div>
  );
}