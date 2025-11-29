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
  helperText?: string;
  variant?: 'default' | 'bare';
  ariaLabel?: string;
  ariaDescribedBy?: string;
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
  error,
  helperText,
  variant = 'default',
  ariaLabel,
  ariaDescribedBy
}: InputProps) => {
  const baseClasses =
    variant === 'bare'
      ? 'w-full bg-transparent text-white placeholder-white/50 text-sm'
      : 'w-full px-4 py-2.5 rounded-2xl bg-white/5 text-white border border-white/10 shadow-inner shadow-black/20 text-sm';

  const interactionClasses =
    variant === 'bare'
      ? 'focus:outline-none focus:ring-0 border-0'
      : 'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50';

  const readOnlyClasses = readOnly ? 'cursor-default opacity-70' : variant === 'bare' ? '' : 'hover:bg-white/8';

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
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        className={`${baseClasses} ${interactionClasses} ${readOnlyClasses} ${className || ''}`.trim()}
      />
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-400">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;