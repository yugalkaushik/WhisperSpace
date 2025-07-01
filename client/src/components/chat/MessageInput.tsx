import { useState, useContext, useEffect } from 'react';
import { SocketContext } from '../../contexts/socket-context';
import Input from '../ui/Input';
import Button from '../ui/Button';
import EmojiPicker from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import { MESSAGE_TYPES, TYPING_TIMEOUT } from '../../utils/constants';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { socket, startTyping, stopTyping } = useContext(SocketContext);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (message.trim()) {
      socket?.emit('send_message', {
        content: message,
        room: 'general',
        messageType: message.length === 1 && /[\uD800-\uDFFF]/.test(message) ? MESSAGE_TYPES.EMOJI : MESSAGE_TYPES.TEXT,
      });
      setMessage('');
      stopTyping('general');
      if (typingTimeout) clearTimeout(typingTimeout);
    }
  };

  const handleTyping = () => {
    startTyping('general');
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => stopTyping('general'), TYPING_TIMEOUT);
    setTypingTimeout(timeout);
  };

  const handleEmojiSelect = (emojiData: { emoji: string }) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      stopTyping('general');
    };
  }, [typingTimeout, stopTyping]);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 relative">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          aria-label="Emoji picker"
        >
          <Smile className="w-5 h-5" />
        </button>
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            handleTyping();
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={!message.trim()}>
          Send
        </Button>
      </div>
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 z-10">
          <EmojiPicker onEmojiClick={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
};

export default MessageInput;