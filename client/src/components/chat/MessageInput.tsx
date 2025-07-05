import { useState, useContext, useEffect } from 'react';
import { SocketContext } from '../../contexts/socket-context';
import Input from '../ui/Input';
import { Button } from '../ui/Button';
import { Smile } from 'lucide-react';
import { MESSAGE_TYPES, TYPING_TIMEOUT } from '../../utils/constants';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { socket, startTyping, stopTyping, currentRoom } = useContext(SocketContext);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (message.trim() && currentRoom?.code) {
      socket?.emit('send_message', {
        content: message,
        room: currentRoom.code,
        messageType: message.length === 1 && /[\uD800-\uDFFF]/.test(message) ? MESSAGE_TYPES.EMOJI : MESSAGE_TYPES.TEXT,
      });
      setMessage('');
      stopTyping(currentRoom.code);
      if (typingTimeout) clearTimeout(typingTimeout);
    }
  };

  const handleTyping = () => {
    if (currentRoom?.code) {
      startTyping(currentRoom.code);
      if (typingTimeout) clearTimeout(typingTimeout);
      const timeout = setTimeout(() => stopTyping(currentRoom.code), TYPING_TIMEOUT);
      setTypingTimeout(timeout);
    }
  };

  const handleEmojiSelect = (emojiData: { emoji: string }) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Handle keyboard shortcut for emoji picker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+E or Cmd+E to open emoji picker
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowEmojiPicker(prev => !prev);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (typingTimeout) clearTimeout(typingTimeout);
      stopTyping('general');
    };
  }, [typingTimeout, stopTyping]);

  return (
    <div className="p-2 md:p-3 bg-zinc-900 border-t border-zinc-800/50">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors flex-shrink-0"
          aria-label="Emoji picker"
          title="Insert emoji (Ctrl+E)"
        >
          <Smile className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
        <Input
          id="message-input"
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
          className="flex-1 bg-zinc-800 text-white placeholder-zinc-400 border-0 rounded-md py-1.5 md:py-2 text-sm focus:ring-1 focus:ring-indigo-500"
        />
        <Button 
          onClick={handleSend} 
          disabled={!message.trim()} 
          className="px-2 py-1.5 md:px-3 md:py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-700 disabled:text-zinc-400 
                    text-white font-medium transition-colors text-sm flex-shrink-0"
          variant="primary"
        >
          Send
        </Button>
      </div>
      {showEmojiPicker && (
        <div className="absolute bottom-12 md:bottom-14 left-2 md:left-3 z-50 rounded-lg overflow-hidden shadow-xl">
          <EmojiPicker onEmojiClick={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
};

export default MessageInput;