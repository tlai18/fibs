import React from 'react';

interface GameButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function GameButton({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  fullWidth = false
}: GameButtonProps) {
  const baseClasses = 'font-bold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed disabled:hover:shadow-none';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white hover:shadow-lg hover:shadow-green-500/25',
    secondary: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-blue-200 border border-blue-400/30 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25',
    danger: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-200 border border-red-400/30 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25'
  };
  
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
