import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../contexts/auth-context';
import type { Message } from '../../types';
import Avatar from '../ui/Avatar';
import TypingIndicator from './TypingIndicator';
import { formatMessageTime } from '../../utils/formatters';

const MessageList = ({ messages }: { messages: Message[] }) => {
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={`flex ${msg.sender._id === user?._id ? 'justify-end' : 'justify-start'} items-end space-x-2`}
        >
          {/* Always show avatar for non-current user messages */}
          {msg.sender._id !== user?._id && (
            <Avatar 
              username={msg.sender.username} 
              isOnline={msg.sender.isOnline} 
              avatar={msg.sender.avatar}
              selectedAvatar={msg.sender.selectedAvatar}
            />
          )}
          <div
            className={`max-w-xs p-3 rounded-lg ${
              msg.sender._id === user?._id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
          >
            {/* Show sender name for non-current user messages */}
            {msg.sender._id !== user?._id && (
              <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                {msg.sender.nickname || msg.sender.username}
              </p>
            )}
            <p className="text-sm">{msg.content}</p>
            <p className="text-xs opacity-75 mt-1">{formatMessageTime(msg.createdAt)}</p>
          </div>
          {/* Show avatar for current user messages on the right */}
          {msg.sender._id === user?._id && (
            <Avatar 
              username={msg.sender.username} 
              isOnline={msg.sender.isOnline} 
              avatar={msg.sender.avatar}
              selectedAvatar={msg.sender.selectedAvatar}
            />
          )}
        </div>
      ))}
      <TypingIndicator />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;