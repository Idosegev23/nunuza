'use client';

import { useConversations, Conversation } from '@/hooks/useConversations';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { MessageCircleIcon, LoaderIcon, ImageIcon } from 'lucide-react';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const { t, i18n } = useTranslation();
  const { conversations, loading, error } = useConversations();

  const getLocale = () => {
    switch (i18n.language) {
      case 'fr': return fr;
      case 'sw': return enUS; // Using English for Swahili as date-fns doesn't have Swahili locale
      default: return enUS;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoaderIcon className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">{t('messages.loading_conversations')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageCircleIcon className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('messages.no_conversations')}
        </h3>
        <p className="text-gray-500 text-sm max-w-sm">
          {t('messages.start_messaging_desc')}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        const timeAgo = formatDistanceToNow(new Date(conversation.last_message_at), {
          addSuffix: true,
          locale: getLocale()
        });

        const isSelected = conversation.id === selectedConversationId;

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar placeholder */}
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 font-medium text-sm">
                  {conversation.other_participant?.email?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                {/* Header with name and time */}
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {conversation.other_participant?.email || t('messages.unknown_user')}
                  </h4>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {timeAgo}
                  </span>
                </div>

                {/* Post info if available */}
                {conversation.post && (
                  <div className="flex items-center gap-2 mb-1">
                    <ImageIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-500 truncate">
                      {conversation.post.title}
                    </span>
                  </div>
                )}

                {/* Last message preview */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.last_message?.content || t('messages.no_messages_yet')}
                  </p>
                  
                  {/* Unread indicator - will be implemented with proper read tracking */}
                  {conversation.last_message && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 