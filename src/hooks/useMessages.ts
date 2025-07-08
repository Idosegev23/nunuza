import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    email: string;
  };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!conversationId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    fetchMessages();
    setupRealtimeSubscription();
    markMessagesAsRead();
  }, [conversationId, user]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          read_at,
          created_at,
          updated_at
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Get sender info from auth.users for each unique sender
      const senderIds = [...new Set(messagesData?.map(m => m.sender_id) || [])];
      
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const userMap = new Map(authUsers.users.map(u => [u.id, { id: u.id, email: u.email || 'Unknown' }]));

      const enrichedMessages = messagesData?.map(message => ({
        ...message,
        sender: userMap.get(message.sender_id)
      })) || [];

      setMessages(enrichedMessages);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = useCallback(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Add new message to the list
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Mark as read if it's from another user
          if (newMessage.sender_id !== user?.id) {
            markMessageAsRead(newMessage.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Update message in the list (for read status, etc.)
          const updatedMessage = payload.new as Message;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, user?.id]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !user || !content.trim()) {
      throw new Error('Cannot send message: missing conversation or content');
    }

    try {
      setSending(true);
      setError(null);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        })
        .select('*')
        .single();

      if (error) throw error;

      // Message will be added via realtime subscription
      return data;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setSending(false);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('sender_id', user?.id); // Only mark our own messages as read
    } catch (err) {
      console.warn('Failed to mark message as read:', err);
    }
  };

  const markMessagesAsRead = async () => {
    if (!conversationId || !user) return;

    try {
      // Mark all unread messages from other users as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);
    } catch (err) {
      console.warn('Failed to mark messages as read:', err);
    }
  };

  const getUnreadCount = () => {
    return messages.filter(msg => 
      !msg.read_at && msg.sender_id !== user?.id
    ).length;
  };

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    markMessageAsRead,
    markMessagesAsRead,
    getUnreadCount,
    refetch: fetchMessages
  };
} 