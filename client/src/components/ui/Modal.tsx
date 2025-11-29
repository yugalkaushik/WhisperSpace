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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="frosted-card w-full max-w-lg p-6 md:p-8 relative">
        <button
          aria-label="Close dialog"
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-white transition"
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-white font-sf-pro gradient-text">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;