
import React, { useState } from 'react';
import { ConversationsList } from '@/components/ConversationsList';
import { MessagingInterface } from '@/components/MessagingInterface';

const Messages = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ConversationsList
            onSelectConversation={setSelectedConversationId}
            selectedConversationId={selectedConversationId}
          />
        </div>
        <div className="lg:col-span-2">
          <MessagingInterface conversationId={selectedConversationId} />
        </div>
      </div>
    </div>
  );
};

export default Messages;
