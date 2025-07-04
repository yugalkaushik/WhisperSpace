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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-black p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-white font-sf-pro">{title}</h2>
        {children}
        <button
          className="mt-6 px-4 py-2 rounded-xl text-white bg-gray-800 hover:bg-gray-700 transition-all duration-300 font-medium font-sf-pro-text shadow-md"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;