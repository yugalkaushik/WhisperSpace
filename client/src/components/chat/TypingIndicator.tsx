import { useContext } from 'react';
import { SocketContext } from '../../contexts/socket-context';

const TypingIndicator = () => {
  const { typingUsers } = useContext(SocketContext);

  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 p-2.5 m-2 text-indigo-200 bg-zinc-800/90 rounded-full shadow-md shadow-black/20 backdrop-blur-md animate-fadeIn animate-pulse-subtle max-w-max">
      <div className="flex space-x-1 bg-indigo-900/70 p-1.5 rounded-full">
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm font-medium font-sf-pro-text pr-3">
        {typingUsers.length === 1
          ? <><span className="text-indigo-300 font-bold">{typingUsers[0].username}</span> is typing...</>
          : typingUsers.length === 2
          ? <><span className="text-indigo-300 font-bold">{typingUsers[0].username}</span> and <span className="text-indigo-300 font-bold">{typingUsers[1].username}</span> are typing...</>
          : <><span className="text-indigo-300 font-bold">{typingUsers[0].username}</span> and <span className="text-indigo-300 font-bold">{typingUsers.length - 1}</span> others are typing...</>}
      </span>
    </div>
  );
};

export default TypingIndicator;