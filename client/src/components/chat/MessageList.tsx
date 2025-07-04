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
    // If this is the current user's message, use their nickname from localStorage
    if (user && messageUser._id === user._id) {
      return profile.nickname || user.username;
    }
    // For other users, just use their username
    return messageUser.username;
  };

  const getAvatarForUser = (messageUser: User) => {
    // If this is the current user's message, use their selected avatar from localStorage
    if (user && messageUser._id === user._id) {
      return profile.selectedAvatar;
    }
    
    // For other users, generate consistent avatar based on username characters
    // This ensures the same user always gets the same avatar
    let nameSum = 0;
    for (let i = 0; i < messageUser.username.length; i++) {
      nameSum += messageUser.username.charCodeAt(i);
    }
    
    // Determine avatar based on character sum modulo 12
    const avatarNumber = (nameSum % 12) + 1;
    return `avatar${avatarNumber}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 md:px-6 md:py-4 min-h-0">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-3">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-base md:text-lg font-medium text-white font-sf-pro">No messages yet</h3>
          <p className="text-sm text-zinc-400 font-sf-pro-text mt-1">
            Start the conversation by typing a message below
          </p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {messages.map((msg) => {
            const isOwnMessage = user && msg.sender._id === user._id;
            
            return (
              <div
                key={msg._id}
                className={`flex items-start ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 ${isOwnMessage ? 'ml-2' : 'mr-2'} mt-1`}>
                  <Avatar 
                    username={getDisplayName(msg.sender)} 
                    selectedAvatar={getAvatarForUser(msg.sender)}
                    isOnline={msg.sender.isOnline} 
                    size="sm"
                  />
                </div>
                <div className={`${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col max-w-[80%] md:max-w-[70%]`}>
                  <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'} w-full`}>
                    <p className="text-xs md:text-sm font-medium text-white font-sf-pro">
                      {getDisplayName(msg.sender)}
                    </p>
                    <p className="text-xs text-zinc-400 font-sf-pro-text">
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                  <div className={`px-4 py-2.5 rounded-lg ${
                    isOwnMessage 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-zinc-800 text-white'
                  }`}>
                    <p className="text-sm leading-relaxed font-sf-pro-text">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <TypingIndicator />
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;