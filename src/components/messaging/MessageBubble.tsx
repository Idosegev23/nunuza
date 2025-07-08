'use client';

import { Message } from '@/hooks/useMessages';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr, sw } from 'date-fns/locale';
import { CheckIcon, CheckCheckIcon } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  showSender?: boolean;
}

export function MessageBubble({ message, showSender = false }: MessageBubbleProps) {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  
  const isOwnMessage = message.sender_id === user?.id;
  
  const getLocale = () => {
    switch (i18n.language) {
      case 'fr': return fr;
      case 'sw': return sw;
      default: return enUS;
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
    locale: getLocale()
  });

  return (
    <div className={`flex flex-col mb-4 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
      {showSender && !isOwnMessage && (
        <div className="text-xs text-gray-500 mb-1 px-3">
          {message.sender?.email || t('messages.unknown_sender')}
        </div>
      )}
      
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwnMessage
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}
      >
        <div className="break-words whitespace-pre-wrap">
          {message.content}
        </div>
        
        <div className={`flex items-center gap-1 mt-1 text-xs ${
          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
        }`}>
          <span>{timeAgo}</span>
          
          {isOwnMessage && (
            <div className="flex items-center">
              {message.read_at ? (
                <CheckCheckIcon size={12} className="text-blue-200" />
              ) : (
                <CheckIcon size={12} className="text-blue-300" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 