import { useContext } from 'react';
import { SocketContext } from '../../contexts/SocketContext';
import Avatar from '../ui/Avatar';
import { OnlineUser } from '../../types';
import { formatLastSeen } from '../../utils/formatters';

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
            <Avatar username={user.username} isOnline={true} />
            <div>
              <p className="text-gray-800 dark:text-white">{user.username}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Active now</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;