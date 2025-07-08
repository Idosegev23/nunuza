'use client';

import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { MessageBubble } from './MessageBubble';
import { useTranslation } from 'react-i18next';
import { SendIcon, LoaderIcon, ArrowLeftIcon } from 'lucide-react';

interface ChatWindowProps {
  conversationId: string;
  otherUserEmail?: string;
  postTitle?: string;
  onBack?: () => void;
}

export function ChatWindow({ conversationId, otherUserEmail, postTitle, onBack }: ChatWindowProps) {
  const { t } = useTranslation();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    messages,
    loading,
    error,
    sending,
    sendMessage
  } = useMessages(conversationId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || sending) return;

    try {
      await sendMessage(messageText);
      setMessageText('');
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoaderIcon className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">{t('messages.loading')}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gray-50">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            aria-label={t('common.back')}
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
        )}
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {otherUserEmail || t('messages.conversation')}
          </h3>
          {postTitle && (
            <p className="text-sm text-gray-500 truncate">
              {t('messages.about_post')}: {postTitle}
            </p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="mb-2">{t('messages.no_messages')}</p>
              <p className="text-sm">{t('messages.start_conversation')}</p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            showSender={false}
          />
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('messages.type_message')}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
            style={{
              minHeight: '40px',
              maxHeight: '120px',
              height: 'auto'
            }}
            disabled={sending}
          />
          
          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {sending ? (
              <LoaderIcon className="w-4 h-4 animate-spin" />
            ) : (
              <SendIcon className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{t('messages.send')}</span>
          </button>
        </div>
      </form>
    </div>
  );
} 