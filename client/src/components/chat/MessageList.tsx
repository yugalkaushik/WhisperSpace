import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import type { Message, User } from '../../types';
import TypingIndicator from './TypingIndicator';
import { formatMessageTime } from '../../utils/formatters';

const MessageList = ({ messages }: { messages: Message[] }) => {
  const { user } = useContext(AuthContext);
  const { profile } = useProfile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getDisplayName = (messageUser: User) => {
    if (user && messageUser._id === user._id) {
      return profile.nickname || user.username;
    }
    return messageUser.username;
  };

  // Generate consistent color for each user based on their ID
  const getUserColor = (userId: string) => {
    const colors = [
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // green
      '#06b6d4', // cyan
      '#f97316', // orange
      '#14b8a6', // teal
      '#6366f1', // indigo
      '#a855f7', // violet
    ];
    
    // Use user ID to generate consistent color
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex flex-col px-3 py-4 md:px-6 md:py-6 overflow-hidden">
      <div
        className="hide-scrollbar flex-1 space-y-3 overflow-y-auto"
        role="log"
        aria-live="polite"
        aria-label="Room messages"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center" role="status">
            <div className="mb-4 bg-white/5 p-4" style={{ borderRadius: 'var(--border-radius)' }} aria-hidden="true">
              <svg className="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none">
                <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">No messages yet</h3>
            <p className="mt-1 text-sm text-slate-400">Say hi to kick things off.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwnMessage = user && msg.sender._id === user._id;

              return (
                <article
                  key={msg._id}
                  className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
                  role="listitem"
                  aria-label={`${getDisplayName(msg.sender)} at ${formatMessageTime(msg.createdAt)}`}
                >
                  <div className="bg-black/80 border border-white/10 px-4 py-3 max-w-[85%]" style={{ borderRadius: 'var(--border-radius)' }}>
                    <div className={`flex items-center gap-2 mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <span 
                        className="text-xs font-medium" 
                        style={{ color: isOwnMessage ? 'white' : getUserColor(msg.sender._id) }}
                      >
                        {getDisplayName(msg.sender)}
                      </span>
                      <span className="text-xs text-slate-400">{formatMessageTime(msg.createdAt)}</span>
                    </div>
                    <div className="text-sm text-white leading-relaxed break-words">
                      {msg.content}
                    </div>
                  </div>
                </article>
              );
            })}
            <TypingIndicator />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;