import { useContext } from 'react';
import { SocketContext } from '../../contexts/socket-context';

const TypingIndicator = () => {
  const { typingUsers } = useContext(SocketContext);

  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 p-2 text-gray-500 dark:text-gray-400">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm">
        {typingUsers.length === 1
          ? `${typingUsers[0].username} is typing...`
          : typingUsers.length === 2
          ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`
          : `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`}
      </span>
    </div>
  );
};

export default TypingIndicator;