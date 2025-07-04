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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-black p-6 md:p-8 rounded-2xl md:rounded-3xl w-full max-w-md shadow-2xl">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-white font-sf-pro">{title}</h2>
        {children}
        <button
          className="mt-4 md:mt-6 px-4 py-2 rounded-xl text-white bg-gray-800 hover:bg-gray-700 transition-all duration-300 font-medium font-sf-pro-text shadow-md text-sm md:text-base"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;