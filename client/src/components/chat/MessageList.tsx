import { useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from '../../contexts/SocketContext';
import { AuthContext } from '../../contexts/AuthContext';
import { Message } from '../../types';
import Avatar from '../ui/Avatar';
import TypingIndicator from './TypingIndicator';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { formatMessageTime } from '../../utils/formatters';

const MessageList = ({ messages }: { messages: Message[] }) => {
  const { user } = useContext(AuthContext);
  const { socket, editMessage, deleteMessage } = useContext(SocketContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; messageId?: string; content?: string }>({ open: false });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEditMessage = (message: Message) => {
    if (message.sender._id === user?._id && new Date().getTime() - new Date(message.createdAt).getTime() < 15 * 60 * 1000) {
      setEditModal({ open: true, messageId: message._id, content: message.content });
    }
  };

  const handleSaveEdit = () => {
    if (editModal.messageId && editModal.content) {
      editMessage(editModal.messageId, editModal.content, 'general');
      setEditModal({ open: false });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessage(messageId, 'general');
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.sender._id === user?._id ? 'justify-end' : 'justify-start'} items-end space-x-2`}
            onDoubleClick={() => handleEditMessage(msg)}
          >
            {msg.sender._id !== user?._id && (
              <Avatar username={msg.sender.username} isOnline={msg.sender.isOnline} avatar={msg.sender.avatar} />
            )}
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.sender._id === user?._id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
            >
              {msg.sender._id !== user?._id && (
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{msg.sender.username}</p>
              )}
              <p className="text-sm">{msg.content}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs opacity-75">{formatMessageTime(msg.createdAt)}</p>
                {msg.sender._id === user?._id && (
                  <div className="flex space-x-1">
                    {new Date().getTime() - new Date(msg.createdAt).getTime() < 15 * 60 * 1000 && (
                      <button
                        onClick={() => handleEditMessage(msg)}
                        className="text-xs text-blue-500 hover:text-blue-600"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              {msg.isEdited && (
                <p className="text-xs opacity-75 italic">(Edited)</p>
              )}
            </div>
          </div>
        ))}
        <TypingIndicator />
        <div ref={messagesEndRef} />
      </div>
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false })}
        title="Edit Message"
      >
        <Input
          type="text"
          value={editModal.content || ''}
          onChange={(e) => setEditModal({ ...editModal, content: e.target.value })}
          placeholder="Edit your message"
          className="mb-4"
        />
        <Button onClick={handleSaveEdit} disabled={!editModal.content?.trim()}>
          Save
        </Button>
      </Modal>
    </>
  );
};

export default MessageList;