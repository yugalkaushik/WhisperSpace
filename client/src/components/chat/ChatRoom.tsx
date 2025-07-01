import { useContext } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import ThemeToggle from '../ui/ThemeToggle';
import { AuthContext } from '../../contexts/AuthContext';
import { SocketContext } from '../../contexts/SocketContext';

const ChatRoom = () => {
  const { user, logout } = useContext(AuthContext);
  const { messages } = useContext(SocketContext);

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <header className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <h1 className="text-xl font-semibold">ConnectSphere</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm">{user?.username}</span>
          <ThemeToggle />
          <button
            onClick={logout}
            className="text-white hover:text-gray-200 text-sm"
          >
            Logout
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <UserList />
        <div className="flex-1 flex flex-col">
          <MessageList messages={messages} />
          <MessageInput />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;