
import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface MessagingInterfaceProps {
  conversationId?: string;
}

export const MessagingInterface = ({ conversationId }: MessagingInterfaceProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { messages, loading, sendMessage } = useMessages(conversationId);
  const { user } = useAuth();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || sending) return;

    setSending(true);
    try {
      await sendMessage(conversationId, newMessage.trim());
      setNewMessage('');
      toast.success('Message sent!');
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversationId) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4" />
            <p>Select a conversation to start messaging</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
          {loading ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
