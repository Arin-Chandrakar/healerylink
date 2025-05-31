
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string | null;
  read_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Conversation {
  id: string;
  patient_id: string;
  doctor_id: string;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useMessages = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch conversations for the current user
  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
    } else {
      setConversations(data || []);
    }
    setLoading(false);
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (convId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  // Send a new message
  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: 'text',
      });

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Create a new conversation
  const createConversation = async (patientId: string, doctorId: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    return data;
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!conversationId) return;

    const messagesChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [conversationId]);

  // Fetch conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    createConversation,
    fetchConversations,
    fetchMessages,
  };
};
