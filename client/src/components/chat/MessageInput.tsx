import { useState, useContext, useEffect, useCallback } from 'react';
import { SocketContext } from '../../contexts/socket-context';
import Input from '../ui/Input';
import { Smile, Navigation } from 'lucide-react';
import { MESSAGE_TYPES, TYPING_TIMEOUT } from '../../utils/constants';
import EmojiPicker from 'emoji-picker-react';

interface MessageInputProps {
  variant?: 'standalone' | 'embedded';
}

const MessageInput = ({ variant = 'standalone' }: MessageInputProps) => {
  const helperTextId = 'message-input-helper';

  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { sendMessage, startTyping, stopTyping, currentRoom } = useContext(SocketContext);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const getRoomCode = useCallback(() => {
    if (currentRoom?.code) {
      return currentRoom.code.toUpperCase();
    }
    return null;
  }, [currentRoom?.code]);

  const handleSend = () => {
    const roomCode = getRoomCode();
    const messageContent = message.trim();
    if (messageContent && roomCode) {
      const messageType = messageContent.length === 1 && /[\uD800-\uDFFF]/.test(messageContent)
        ? MESSAGE_TYPES.EMOJI
        : MESSAGE_TYPES.TEXT;

      sendMessage(messageContent, roomCode, messageType);
      setMessage('');
      stopTyping(roomCode);
      if (typingTimeout) clearTimeout(typingTimeout);
    }
  };

  const handleTyping = () => {
    const roomCode = getRoomCode();
    if (roomCode) {
      startTyping(roomCode);
      if (typingTimeout) clearTimeout(typingTimeout);
      const timeout = setTimeout(() => stopTyping(roomCode), TYPING_TIMEOUT);
      setTypingTimeout(timeout);
    }
  };

  const handleEmojiSelect = (emojiData: { emoji: string }) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowEmojiPicker(prev => !prev);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (typingTimeout) clearTimeout(typingTimeout);
      const roomCode = getRoomCode();
      if (roomCode) {
        stopTyping(roomCode);
      }
    };
  }, [typingTimeout, stopTyping, getRoomCode]);

  const wrapperClasses = variant === 'embedded'
    ? 'px-4 py-4'
    : 'border-t border-white/5 bg-[#070707] px-4 py-4';

  return (
    <div className={wrapperClasses}>
      <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-[#0f0f0f] px-3 py-2 shadow-inner shadow-black/60">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          type="button"
          className="rounded-2xl border border-white/10 p-2 text-slate-300 transition hover:border-white/30 hover:text-white"
          aria-label="Emoji picker"
          aria-expanded={showEmojiPicker}
          title="Insert emoji (Ctrl+E)"
        >
          <Smile className="h-4 w-4" />
        </button>
        <p id={helperTextId} className="sr-only">
          Type your message. Press Enter to send or Shift plus Enter for a new line. Use Ctrl plus E to toggle emoji picker.
        </p>
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
          variant="bare"
          className="flex-1"
          ariaLabel="Message composer"
          ariaDescribedBy={helperTextId}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || !getRoomCode()}
          type="button"
          aria-label="Send message"
          className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-[#0a0f1c] text-white transition hover:border-white/40 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Navigation className="h-4 w-4 transition group-hover:translate-x-0.5" strokeWidth={2.4} />
        </button>
      </div>
      {showEmojiPicker && (
        <div className="relative" aria-live="polite">
          <div className="absolute bottom-2 left-0 z-50 overflow-hidden rounded-2xl border border-white/10 shadow-2xl" role="dialog" aria-label="Emoji picker">
            <EmojiPicker onEmojiClick={handleEmojiSelect} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;