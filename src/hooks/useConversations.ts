import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  post_id?: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  last_message?: {
    content: string;
    sender_id: string;
    created_at: string;
  };
  other_participant?: {
    id: string;
    email: string | null | undefined;
  };
  post?: {
    id: string;
    title: string;
    images: string[];
  };
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    fetchConversations();
    setupRealtimeSubscription();
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get conversations with last message and participant info
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          participant_1,
          participant_2,
          post_id,
          created_at,
          updated_at,
          last_message_at,
          posts (
            id,
            title,
            images
          )
        `)
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`)
        .order('last_message_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Get last messages for each conversation
      const conversationIds = conversationsData?.map(c => c.id) || [];
      
      const { data: lastMessages, error: messagesError } = await supabase
        .from('messages')
        .select('conversation_id, content, sender_id, created_at')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Get participant emails
      const participantIds = conversationsData?.flatMap(c => [c.participant_1, c.participant_2]) || [];
      const uniqueParticipantIds = [...new Set(participantIds)];

      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', uniqueParticipantIds);

      if (usersError) {
        // Fallback to auth.users if profiles don't exist
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const userMap = new Map(authUsers.users.map(u => [u.id, { id: u.id, email: u.email }]));
        
        const enrichedConversations = conversationsData?.map(conversation => {
          const lastMessage = lastMessages?.find(m => m.conversation_id === conversation.id);
          const otherParticipantId = conversation.participant_1 === user!.id 
            ? conversation.participant_2 
            : conversation.participant_1;
          const otherParticipant = userMap.get(otherParticipantId);

          return {
            ...conversation,
            last_message: lastMessage || undefined,
            other_participant: otherParticipant || undefined,
            post: Array.isArray(conversation.posts) ? conversation.posts[0] : conversation.posts || undefined
          };
        }) || [];

        setConversations(enrichedConversations);
      } else {
        const userMap = new Map(users.map(u => [u.id, u]));
        
        const enrichedConversations = conversationsData?.map(conversation => {
          const lastMessage = lastMessages?.find(m => m.conversation_id === conversation.id);
          const otherParticipantId = conversation.participant_1 === user!.id 
            ? conversation.participant_2 
            : conversation.participant_1;
          const otherParticipant = userMap.get(otherParticipantId);

          return {
            ...conversation,
            last_message: lastMessage || undefined,
            other_participant: otherParticipant || undefined,
            post: Array.isArray(conversation.posts) ? conversation.posts[0] : conversation.posts || undefined
          };
        }) || [];

        setConversations(enrichedConversations);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_1=eq.${user!.id},participant_2=eq.${user!.id}`
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const createConversation = async (otherUserId: string, postId?: string) => {
    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(participant_1.eq.${user!.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user!.id})`
        )
        .eq('post_id', postId || null)
        .single();

      if (existingConversation) {
        return existingConversation.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user!.id,
          participant_2: otherUserId,
          post_id: postId || null
        })
        .select('id')
        .single();

      if (error) throw error;

      await fetchConversations();
      return data.id;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      throw err;
    }
  };

  const getUnreadCount = () => {
    // This will be implemented when we add read status tracking
    return 0;
  };

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    createConversation,
    getUnreadCount
  };
} 