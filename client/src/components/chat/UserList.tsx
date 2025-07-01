import { useContext } from 'react';
import { SocketContext } from '../../contexts/socket-context';
import Avatar from '../ui/Avatar';

const UserList = () => {
  const { onlineUsers } = useContext(SocketContext);

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <h2 className="p-4 text-lg font-semibold text-gray-800 dark:text-white">
        Online Users
      </h2>
      <ul className="p-4 space-y-4">
        {onlineUsers.map((user) => (
          <li key={user.userId} className="flex items-center space-x-3">
            <Avatar 
              username={user.username} 
              isOnline={true}
              selectedAvatar={user.selectedAvatar}
            />
            <div>
              <p className="text-gray-800 dark:text-white">
                {user.nickname || user.username}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Active now</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;