import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  size = 'md',
  className = ''
}: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (onClick) {
      onClick(e);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-4 py-2 text-sm rounded-2xl',
    lg: 'px-5 py-3 text-base rounded-3xl'
  };

  const baseClasses = `inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 shadow-lg shadow-black/25 ${sizeClasses[size]}`;

  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-gradient-to-r from-[#071a3a] via-[#0b2f5a] to-[#010915] text-white hover:brightness-110 hover:-translate-y-0.5 border border-[#1d4ed8]/30',
    secondary: 'bg-[#0b1f3d]/70 text-white border border-white/10 hover:bg-[#112a52]/80 hover:-translate-y-0.5',
    ghost: 'bg-transparent text-slate-200 border border-white/5 hover:bg-[#0b1b36]/60 hover:text-white',
    danger: 'bg-gradient-to-r from-[#0c1b38] via-[#0b2d55] to-[#030915] text-rose-200 hover:brightness-110 hover:-translate-y-0.5 border border-[#1d4ed8]/30'
  };

  const disabledClasses = 'opacity-45 cursor-not-allowed hover:translate-y-0 hover:brightness-100 shadow-none';

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? disabledClasses : ''} ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export default Button;