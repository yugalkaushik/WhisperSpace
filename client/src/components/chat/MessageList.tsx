import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../contexts/auth-context';
import { useProfile } from '../../hooks/useProfile';
import type { Message, User } from '../../types';
import Avatar from '../ui/Avatar';
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

  const getAvatarForUser = (messageUser: User) => {
    if (user && messageUser._id === user._id) {
      return profile.selectedAvatar;
    }
    let nameSum = 0;
    for (let i = 0; i < messageUser.username.length; i++) {
      nameSum += messageUser.username.charCodeAt(i);
    }
    const avatarNumber = (nameSum % 12) + 1;
    return `avatar${avatarNumber}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 px-3 py-4 md:px-6 md:py-6">
      <div
        className="modern-scroll h-full space-y-4 overflow-y-auto pr-1"
        role="log"
        aria-live="polite"
        aria-label="Room messages"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center" role="status">
            <div className="mb-4 rounded-2xl bg-white/5 p-4" aria-hidden="true">
              <svg className="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none">
                <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">No messages yet</h3>
            <p className="mt-1 text-sm text-slate-400">Say hi to kick things off.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwnMessage = user && msg.sender._id === user._id;

              return (
                <article
                  key={msg._id}
                  className={`flex items-start ${isOwnMessage ? 'flex-row-reverse text-right' : ''}`}
                  role="listitem"
                  aria-label={`${getDisplayName(msg.sender)} at ${formatMessageTime(msg.createdAt)}`}
                >
                  <div className={`mt-1 flex-shrink-0 ${isOwnMessage ? 'ml-3' : 'mr-3'}`}>
                    <Avatar
                      username={getDisplayName(msg.sender)}
                      selectedAvatar={getAvatarForUser(msg.sender)}
                      isOnline={msg.sender.isOnline}
                      size="sm"
                    />
                  </div>
                  <div className={`${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col max-w-[80%] md:max-w-[70%]`}>
                    <div className={`flex items-center gap-2 text-xs text-slate-400 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                      <span className="font-medium text-white">{getDisplayName(msg.sender)}</span>
                      <span>{formatMessageTime(msg.createdAt)}</span>
                    </div>
                    <div
                      className={`mt-1 rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-lg transition-all ${
                        isOwnMessage
                          ? 'border-sky-500/40 bg-gradient-to-r from-[#0b2d58]/90 via-[#082146]/85 to-[#030913]/90 text-white'
                          : 'border-white/10 bg-white/5 text-white'
                      }`}
                    >
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