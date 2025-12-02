import { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { SocketContext } from '../../contexts/SocketContext';
import Input from '../ui/Input';
import { Smile, SendHorizontal } from 'lucide-react';
import { MESSAGE_TYPES, TYPING_TIMEOUT } from '../../utils/constants';
import EmojiPicker from 'emoji-picker-react';

interface MessageInputProps {
  variant?: 'standalone' | 'embedded';
  onFocus?: () => void;
}

const MessageInput = ({ variant = 'standalone', onFocus }: MessageInputProps) => {
  const helperTextId = 'message-input-helper';

  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { sendMessage, startTyping, stopTyping, currentRoom } = useContext(SocketContext);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowEmojiPicker(prev => !prev);
      }
      if (e.key === 'Escape' && showEmojiPicker) {
        setShowEmojiPicker(false);
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
  }, [typingTimeout, stopTyping, getRoomCode, showEmojiPicker]);

  const wrapperClasses = variant === 'embedded'
    ? 'relative px-3 sm:px-4 py-3 sm:py-4'
    : 'relative bg-[#070707] px-3 sm:px-4 py-3 sm:py-4';

  return (
    <div className={wrapperClasses}>
      <div className="flex items-center gap-2 sm:gap-3 border border-white/10 bg-[#0f0f0f] px-2 sm:px-3 py-2 shadow-inner shadow-black/60" style={{ borderRadius: 'var(--border-radius)' }}>
        <button
          ref={emojiButtonRef}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          type="button"
          className="border border-white/10 p-1.5 sm:p-2 text-slate-300 transition hover:border-white/30 hover:text-white"
          style={{ borderRadius: 'var(--border-radius)' }}
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
          onFocus={() => {
            // Trigger scroll when input is focused
            if (onFocus) {
              onFocus();
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
          className="text-blue-500 transition hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <SendHorizontal className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-16 sm:bottom-20 left-2 sm:left-4 z-50" aria-live="polite">
          <div className="overflow-hidden border border-white/10 shadow-2xl" style={{ borderRadius: 'var(--border-radius)' }} role="dialog" aria-label="Emoji picker">
            <EmojiPicker onEmojiClick={handleEmojiSelect} width={280} height={350} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;