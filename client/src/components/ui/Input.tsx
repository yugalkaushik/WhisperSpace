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
}

const Input = ({ type, value, onChange, onKeyDown, placeholder, className, maxLength, readOnly }: InputProps) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      maxLength={maxLength}
      readOnly={readOnly}
      className={`w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'cursor-default bg-gray-50 dark:bg-gray-700' : ''} ${className || ''}`}
    />
  );
};

export default Input;