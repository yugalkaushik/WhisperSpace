import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  type = 'button', 
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

  const baseClasses = "px-5 py-2.5 rounded-xl font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 font-sf-pro shadow-md shadow-black/20";
  
  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:shadow-indigo-500/20 hover:transform hover:scale-[1.02]",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-white hover:shadow-lg hover:shadow-black/30 hover:transform hover:scale-[1.02]",
    danger: "bg-red-600 hover:bg-red-700 text-white hover:shadow-lg hover:shadow-red-500/20 hover:transform hover:scale-[1.02]"
  };

  const disabledClasses = "bg-zinc-900 text-zinc-600 cursor-not-allowed";

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

// Keep default export for backward compatibility
export default Button;