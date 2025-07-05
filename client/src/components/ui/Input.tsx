import type { ChangeEvent, KeyboardEvent } from 'react';

interface InputProps {
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  readOnly?: boolean;
  id?: string;
  label?: string;
  error?: string;
}

const Input = ({ 
  type, 
  value, 
  onChange, 
  onKeyDown, 
  placeholder, 
  className, 
  maxLength, 
  readOnly, 
  id,
  label,
  error
}: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-300 font-sf-pro mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        readOnly={readOnly}
        className={`w-full px-3 py-2 rounded-lg bg-zinc-800 text-white shadow-md shadow-black/20 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-transparent hover:border-transparent placeholder-indigo-300/60 font-sf-pro-text text-sm ${readOnly ? 'cursor-default bg-zinc-900' : ''} ${className || ''}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;