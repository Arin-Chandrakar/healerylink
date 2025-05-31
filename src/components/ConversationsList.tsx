
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, User } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/context/AuthContext';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

export const ConversationsList = ({ onSelectConversation, selectedConversationId }: ConversationsListProps) => {
  const { conversations, loading } = useMessages();
  const { user } = useAuth();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">Loading conversations...</div>
        </CardContent>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4" />
            <p>No conversations yet</p>
            <p className="text-sm">Start by messaging a doctor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Conversations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {conversations.map((conversation) => {
          const isSelected = conversation.id === selectedConversationId;
          const otherUserId = conversation.patient_id === user?.id 
            ? conversation.doctor_id 
            : conversation.patient_id;
          
          return (
            <Button
              key={conversation.id}
              variant={isSelected ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectConversation(conversation.id)}
            >
              <User className="w-4 h-4 mr-2" />
              <div className="text-left">
                <p className="font-medium">
                  {conversation.patient_id === user?.id ? 'Doctor' : 'Patient'}
                </p>
                <p className="text-xs opacity-70">
                  {new Date(conversation.updated_at).toLocaleDateString()}
                </p>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};
