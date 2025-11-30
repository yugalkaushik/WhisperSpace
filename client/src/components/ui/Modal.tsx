import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}

const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xl"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="border border-white/10 bg-[rgba(15,23,42,0.75)] backdrop-blur-md w-full max-w-lg p-4 sm:p-6 md:p-8 relative max-h-[90vh] overflow-y-auto" style={{ borderRadius: 'var(--border-radius)' }}>
        <button
          aria-label="Close dialog"
          onClick={onClose}
          className="absolute right-3 sm:right-5 top-3 sm:top-5 text-slate-400 hover:text-white transition p-1 text-2xl sm:text-xl"
          style={{ borderRadius: 'var(--border-radius)' }}
        >
          ×
        </button>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-white font-sf-pro gradient-text pr-8">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;